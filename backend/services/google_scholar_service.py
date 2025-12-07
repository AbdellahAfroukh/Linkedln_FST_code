from sqlalchemy.orm import Session
from models.google_scholar import GoogleScholarIntegration, Publication
from models.user import User
from fastapi import HTTPException, status
import requests
from bs4 import BeautifulSoup
from typing import List, Dict, Optional
import re
import datetime
import time
from urllib.parse import quote


class GoogleScholarService:
    
    @staticmethod
    def link_google_scholar(db: Session, user: User, google_scholar_id: str):
        """Link user's Google Scholar account"""
        # Check if user already has a Google Scholar integration
        existing_integration = db.query(GoogleScholarIntegration).filter(
            GoogleScholarIntegration.userId == user.id
        ).first()
        
        if existing_integration:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Google Scholar account already linked. Use update endpoint to change."
            )
        
        # Create profile URL
        profile_url = f"https://scholar.google.com/citations?user={google_scholar_id}"
        
        # Create new integration
        integration = GoogleScholarIntegration(
            googleScholarId=google_scholar_id,
            profileUrl=profile_url,
            userId=user.id,
            lastSynced=None
        )
        
        db.add(integration)
        db.commit()
        db.refresh(integration)
        
        return integration
    
    @staticmethod
    def update_google_scholar_id(db: Session, user: User, google_scholar_id: str):
        """Update user's Google Scholar ID"""
        integration = db.query(GoogleScholarIntegration).filter(
            GoogleScholarIntegration.userId == user.id
        ).first()
        
        if not integration:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Google Scholar integration not found. Please link your account first."
            )
        
        # Update the ID and URL
        integration.googleScholarId = google_scholar_id
        integration.profileUrl = f"https://scholar.google.com/citations?user={google_scholar_id}"
        
        db.commit()
        db.refresh(integration)
        
        return integration
    
    @staticmethod
    def get_google_scholar_integration(db: Session, user: User):
        """Get user's Google Scholar integration"""
        integration = db.query(GoogleScholarIntegration).filter(
            GoogleScholarIntegration.userId == user.id
        ).first()
        
        if not integration:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Google Scholar account not linked"
            )
        
        return integration
    
    @staticmethod
    def scrape_publication_details(pub_url: str, headers: dict) -> Dict:
        """Scrape detailed information from individual publication page"""
        try:
            response = requests.get(pub_url, headers=headers, timeout=10)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')
            
            details = {
                'authors': None,
                'publicationDate': None,
                'journal': None,
                'description': None,
                'abstract': None
            }
            
            # Extract metadata fields
            fields = soup.find_all('div', class_='gsc_oci_field')
            values = soup.find_all('div', class_='gsc_oci_value')
            
            for field, value in zip(fields, values):
                field_name = field.text.strip().lower()
                field_value = value.text.strip()
                
                if 'authors' in field_name or 'auteurs' in field_name:
                    details['authors'] = field_value
                elif 'publication date' in field_name or 'date de publication' in field_name:
                    # Try to parse the date
                    try:
                        # Handle various date formats
                        if '/' in field_value:
                            parts = field_value.split('/')
                            if len(parts) >= 1:
                                year = int(parts[-1])
                                month = int(parts[1]) if len(parts) >= 2 else 1
                                day = int(parts[0]) if len(parts) >= 3 else 1
                                details['publicationDate'] = datetime.date(year, month, day)
                        else:
                            # Just year
                            year = int(field_value)
                            details['publicationDate'] = datetime.date(year, 1, 1)
                    except (ValueError, IndexError):
                        # Try just extracting the year
                        year_match = re.search(r'\d{4}', field_value)
                        if year_match:
                            year = int(year_match.group())
                            details['publicationDate'] = datetime.date(year, 1, 1)
                elif 'journal' in field_name or 'conference' in field_name or 'book' in field_name:
                    details['journal'] = field_value
                elif 'description' in field_name:
                    details['description'] = field_value
            
            # Extract abstract/description
            description_div = soup.find('div', class_='gsh_csp')
            if description_div:
                details['abstract'] = description_div.text.strip()
            
            return details
            
        except Exception as e:
            # Return empty details if scraping fails
            return {
                'authors': None,
                'publicationDate': None,
                'journal': None,
                'description': None,
                'abstract': None
            }
    
    @staticmethod
    def scrape_publications(google_scholar_id: str) -> List[Dict]:
        """Scrape publications from Google Scholar profile sorted by publication date"""
        # Use sortby=pubdate to get publications sorted by date
        base_url = f"https://scholar.google.com/citations?hl=en&user={google_scholar_id}&view_op=list_works&sortby=pubdate&cstart=0&pagesize=100"
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        }
        
        try:
            response = requests.get(base_url, headers=headers, timeout=15)
            response.raise_for_status()
        except requests.RequestException as e:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Failed to fetch Google Scholar profile: {str(e)}"
            )
        
        soup = BeautifulSoup(response.content, 'html.parser')
        publications = []
        
        # Find all publication entries
        pub_rows = soup.find_all('tr', class_='gsc_a_tr')
        
        for row in pub_rows:
            try:
                # Extract title and link
                title_element = row.find('a', class_='gsc_a_at')
                if not title_element:
                    continue
                    
                title = title_element.text.strip()
                pub_link_relative = title_element.get('href', '')
                
                # Ensure sortby=pubdate is in the URL
                if 'sortby=pubdate' not in pub_link_relative:
                    pub_link_relative += '&sortby=pubdate'
                    
                pub_link = "https://scholar.google.com" + pub_link_relative
                
                # Extract citation count
                citation_element = row.find('a', class_='gsc_a_ac')
                citation_count = 0
                if citation_element and citation_element.text.strip():
                    try:
                        citation_count = int(citation_element.text.strip())
                    except ValueError:
                        citation_count = 0
                
                # Extract year from list view
                year_element = row.find('span', class_='gsc_a_h')
                publication_year = None
                if year_element and year_element.text.strip():
                    try:
                        year = int(year_element.text.strip())
                        publication_year = datetime.date(year, 1, 1)
                    except ValueError:
                        pass
                
                # Extract authors and venue (from the list view)
                info_elements = row.find_all('div', class_='gs_gray')
                authors = info_elements[0].text.strip() if len(info_elements) > 0 else ""
                venue = info_elements[1].text.strip() if len(info_elements) > 1 else ""
                
                # Get detailed information from the publication page
                import time
                time.sleep(0.5)  # Be respectful to Google Scholar servers
                pub_details = GoogleScholarService.scrape_publication_details(pub_link, headers)
                
                # Use detailed info if available, fallback to list view info
                if pub_details['publicationDate']:
                    publication_year = pub_details['publicationDate']
                
                # Build summary from available information
                summary_parts = []
                if pub_details['authors'] or authors:
                    summary_parts.append(f"Authors: {pub_details['authors'] or authors}")
                if pub_details['journal'] or venue:
                    summary_parts.append(f"Published in: {pub_details['journal'] or venue}")
                if publication_year:
                    summary_parts.append(f"Year: {publication_year.year}")
                
                summary = " | ".join(summary_parts) if summary_parts else None
                
                publications.append({
                    'title': title,
                    'googleScholarUrl': pub_link,
                    'citationCount': citation_count,
                    'publicationDate': publication_year,
                    'abstract': pub_details['abstract'],
                    'summary': summary[:1000] if summary else None  # Limit summary length
                })
                
            except Exception as e:
                # Skip problematic publications but continue
                continue
        
        return publications
    
    @staticmethod
    def sync_publications(db: Session, user: User):
        """Sync publications from Google Scholar"""
        integration = GoogleScholarService.get_google_scholar_integration(db, user)
        
        # Scrape publications
        scraped_pubs = GoogleScholarService.scrape_publications(integration.googleScholarId)
        
        if not scraped_pubs:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No publications found on Google Scholar profile"
            )
        
        new_count = 0
        updated_count = 0
        
        for pub_data in scraped_pubs:
            # Check if publication already exists
            existing_pub = db.query(Publication).filter(
                Publication.googleScholarIntegrationId == integration.id,
                Publication.title == pub_data['title']
            ).first()
            
            if existing_pub:
                # Update existing publication
                existing_pub.citationCount = pub_data['citationCount']
                existing_pub.publicationDate = pub_data['publicationDate']
                existing_pub.googleScholarUrl = pub_data['googleScholarUrl']
                if pub_data['summary']:
                    existing_pub.summary = pub_data['summary']
                updated_count += 1
            else:
                # Create new publication
                new_pub = Publication(
                    title=pub_data['title'],
                    abstract=pub_data['abstract'],
                    summary=pub_data['summary'],
                    publicationDate=pub_data['publicationDate'],
                    citationCount=pub_data['citationCount'],
                    googleScholarUrl=pub_data['googleScholarUrl'],
                    isPosted=False,
                    googleScholarIntegrationId=integration.id
                )
                db.add(new_pub)
                new_count += 1
        
        # Update last synced date
        integration.lastSynced = datetime.date.today()
        
        db.commit()
        
        total_pubs = db.query(Publication).filter(
            Publication.googleScholarIntegrationId == integration.id
        ).count()
        
        return {
            'success': True,
            'message': 'Publications synced successfully',
            'newPublications': new_count,
            'updatedPublications': updated_count,
            'totalPublications': total_pubs
        }
    
    @staticmethod
    def get_publications(db: Session, user: User, skip: int = 0, limit: int = 100):
        """Get user's publications"""
        integration = GoogleScholarService.get_google_scholar_integration(db, user)
        
        publications = db.query(Publication).filter(
            Publication.googleScholarIntegrationId == integration.id
        ).order_by(Publication.publicationDate.desc()).offset(skip).limit(limit).all()
        
        total = db.query(Publication).filter(
            Publication.googleScholarIntegrationId == integration.id
        ).count()
        
        return {
            'total': total,
            'publications': publications
        }
    
    @staticmethod
    def get_publication_by_id(db: Session, user: User, publication_id: int):
        """Get a specific publication"""
        integration = GoogleScholarService.get_google_scholar_integration(db, user)
        
        publication = db.query(Publication).filter(
            Publication.id == publication_id,
            Publication.googleScholarIntegrationId == integration.id
        ).first()
        
        if not publication:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Publication not found"
            )
        
        return publication
    
    @staticmethod
    def toggle_publication_posted(db: Session, user: User, publication_id: int, is_posted: bool):
        """Toggle whether a publication is posted to the platform"""
        publication = GoogleScholarService.get_publication_by_id(db, user, publication_id)
        
        publication.isPosted = is_posted
        db.commit()
        db.refresh(publication)
        
        return publication
    
    @staticmethod
    def delete_google_scholar_integration(db: Session, user: User):
        """Unlink Google Scholar account"""
        integration = GoogleScholarService.get_google_scholar_integration(db, user)
        
        db.delete(integration)
        db.commit()
        
        return {'message': 'Google Scholar account unlinked successfully'}
