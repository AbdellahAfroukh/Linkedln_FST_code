from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from models.scopus import ScopusIntegration, ScopusPublication
from models.user import User
from models.post import Post
import requests
import datetime
from typing import List, Dict
from config import settings
import logging

logger = logging.getLogger(__name__)


class ScopusService:
    """Service for handling Scopus API integration"""
    
    @staticmethod
    def link_scopus(db: Session, user: User, scopus_author_id: str):
        """Link user's Scopus account"""
        # Check if user already has a Scopus integration
        existing = db.query(ScopusIntegration).filter(
            ScopusIntegration.userId == user.id
        ).first()
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Scopus account already linked"
            )
        
        # Create profile URL
        profile_url = f"https://www.scopus.com/authid/detail.uri?authorId={scopus_author_id}"
        
        # Create integration (verification will happen during sync)
        integration = ScopusIntegration(
            scopusAuthorId=scopus_author_id,
            profileUrl=profile_url,
            userId=user.id
        )
        
        db.add(integration)
        db.commit()
        db.refresh(integration)
        
        return integration
    
    @staticmethod
    def update_scopus_author_id(db: Session, user: User, scopus_author_id: str):
        """Update user's Scopus author ID"""
        integration = ScopusService.get_scopus_integration(db, user)
        
        integration.scopusAuthorId = scopus_author_id
        integration.profileUrl = f"https://www.scopus.com/authid/detail.uri?authorId={scopus_author_id}"
        
        db.commit()
        db.refresh(integration)
        
        return integration
    
    @staticmethod
    def get_scopus_integration(db: Session, user: User):
        """Get user's Scopus integration"""
        integration = db.query(ScopusIntegration).filter(
            ScopusIntegration.userId == user.id
        ).first()
        
        if not integration:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Scopus account not linked"
            )
        
        return integration
    
    @staticmethod
    def _verify_author_exists(scopus_author_id: str):
        """Verify that the Scopus author ID exists"""
        try:
            headers = {
                "X-ELS-APIKey": settings.SCOPUS_API_KEY,
                "Accept": "application/json"
            }
            
            url = f"{settings.SCOPUS_API_BASE_URL}/author/author_id/{scopus_author_id}"
            
            logger.info(f"Verifying Scopus author ID: {scopus_author_id}")
            logger.info(f"Verification URL: {url}")
            
            response = requests.get(url, headers=headers, timeout=10)
            
            logger.info(f"Verification response status: {response.status_code}")
            
            if response.status_code >= 400:
                logger.error(f"Verification failed: {response.text[:500]}")
            
            if response.status_code == 404:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid Scopus Author ID. Please check your ID and try again."
                )
            elif response.status_code == 401:
                logger.error("Scopus API key is invalid")
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail="Scopus API authentication failed"
                )
            elif response.status_code >= 400:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"Scopus API error: {response.status_code}"
                )
                
            return response.json()
            
        except requests.Timeout:
            logger.error("Scopus verification timeout")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Scopus verification timed out"
            )
        except requests.RequestException as e:
            logger.error(f"Scopus verification request error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Failed to verify Scopus author ID"
            )
    
    @staticmethod
    def _get_author_data(scopus_author_id: str) -> Dict:
        """Fetch author data from Scopus API"""
        try:
            headers = {
                "X-ELS-APIKey": settings.SCOPUS_API_KEY,
                "Accept": "application/json"
            }
            
            url = f"{settings.SCOPUS_API_BASE_URL}/author/author_id/{scopus_author_id}"
            
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            
            return response.json()
            
        except requests.Timeout:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Scopus request timed out. Please try again in a few moments."
            )
        except requests.HTTPError as e:
            if e.response.status_code == 429:
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Scopus rate limit reached. Please wait a few minutes and try again."
                )
            elif e.response.status_code == 401:
                logger.error("Scopus API key invalid or expired")
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail="Scopus API authentication failed"
                )
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Scopus returned error: {e.response.status_code}"
            )
        except requests.RequestException as e:
            logger.error(f"Scopus API error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Failed to connect to Scopus API"
            )
    
    @staticmethod
    def _search_author_publications(scopus_author_id: str) -> List[Dict]:
        """Search for publications by author using Scopus Search API"""
        try:
            headers = {
                "X-ELS-APIKey": settings.SCOPUS_API_KEY,
                "Accept": "application/json"
            }
            
            # Use Scopus Search API with author ID filter
            url = f"{settings.SCOPUS_API_BASE_URL}/search/scopus"
            params = {
                "query": f"au-id({scopus_author_id})",
                "start": 0,
                "count": 25,
                "sort": "pubdate-desc"
            }
            
            logger.info(f"Searching Scopus for author ID: {scopus_author_id}")
            logger.info(f"Request URL: {url}")
            logger.info(f"Request params: {params}")
            
            response = requests.get(url, headers=headers, params=params, timeout=15)
            
            logger.info(f"Scopus API response status: {response.status_code}")
            
            if response.status_code >= 400:
                logger.error(f"Scopus API error response: {response.text[:500]}")
            
            response.raise_for_status()
            
            data = response.json()
            entries = data.get("search-results", {}).get("entry", [])
            logger.info(f"Found {len(entries)} publications")
            return entries
            
        except requests.Timeout:
            logger.error("Scopus API request timeout")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Scopus request timed out. Please try again in a few moments."
            )
        except requests.HTTPError as e:
            logger.error(f"Scopus HTTP Error {e.response.status_code}: {e.response.text[:500]}")
            if e.response.status_code == 429:
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Scopus rate limit reached. Please wait a few minutes and try again."
                )
            elif e.response.status_code == 401:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail="Scopus API key is invalid or expired"
                )
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Scopus error: {e.response.status_code}"
            )
        except Exception as e:
            logger.error(f"Error searching Scopus publications: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Failed to search Scopus publications"
            )
    
    @staticmethod
    def sync_publications(db: Session, user: User):
        """Sync publications from Scopus API"""
        integration = ScopusService.get_scopus_integration(db, user)
        
        try:
            # Search for publications by author
            publications_data = ScopusService._search_author_publications(integration.scopusAuthorId)
            
            if not publications_data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="No publications found for this Scopus author"
                )
            
            new_count = 0
            updated_count = 0
            
            for pub_data in publications_data:
                try:
                    # Extract publication data
                    title = pub_data.get("dc:title", "Unknown Title")
                    scopus_id = pub_data.get("eid")
                    
                    # Build Scopus web URL from EID (not the API endpoint)
                    scopus_url = f"https://www.scopus.com/record/display.uri?eid={scopus_id}" if scopus_id else None
                    
                    # Get citation count
                    citation_count = 0
                    if "citedby-count" in pub_data:
                        try:
                            citation_count = int(pub_data["citedby-count"])
                        except (ValueError, TypeError):
                            citation_count = 0
                    
                    # Get publication date
                    publication_date = None
                    pub_date_str = pub_data.get("prism:coverDate")
                    if pub_date_str:
                        try:
                            publication_date = datetime.datetime.strptime(pub_date_str, "%Y-%m-%d").date()
                        except (ValueError, TypeError):
                            pass
                    
                    # Get abstract
                    abstract = None
                    if "dc:description" in pub_data:
                        abstract = pub_data["dc:description"]
                    
                    # Build summary
                    summary_parts = []
                    
                    # Get authors
                    authors = pub_data.get("dc:creator", "Unknown Authors")
                    if authors:
                        summary_parts.append(f"Authors: {authors}")
                    
                    # Get publication name
                    source = pub_data.get("prism:publicationName")
                    if source:
                        summary_parts.append(f"Published in: {source}")
                    
                    # Get year
                    if publication_date:
                        summary_parts.append(f"Year: {publication_date.year}")
                    
                    summary = " | ".join(summary_parts) if summary_parts else None
                    
                    # Check if publication already exists
                    existing_pub = db.query(ScopusPublication).filter(
                        ScopusPublication.scopusIntegrationId == integration.id,
                        ScopusPublication.title == title
                    ).first()
                    
                    if existing_pub:
                        # Update existing publication
                        existing_pub.citationCount = citation_count
                        existing_pub.publicationDate = publication_date
                        existing_pub.scopusUrl = scopus_url
                        if abstract:
                            existing_pub.abstract = abstract
                        if summary:
                            existing_pub.summary = summary
                        updated_count += 1
                    else:
                        # Create new publication
                        new_pub = ScopusPublication(
                            title=title,
                            abstract=abstract,
                            summary=summary,
                            publicationDate=publication_date,
                            citationCount=citation_count,
                            scopusUrl=scopus_url,
                            isPosted=False,
                            scopusIntegrationId=integration.id
                        )
                        db.add(new_pub)
                        new_count += 1
                        
                except Exception as e:
                    logger.error(f"Error processing publication: {str(e)}")
                    continue
            
            # Update last synced date
            integration.lastSynced = datetime.date.today()
            
            db.commit()
            
            total_pubs = db.query(ScopusPublication).filter(
                ScopusPublication.scopusIntegrationId == integration.id
            ).count()
            
            return {
                'success': True,
                'message': 'Publications synced successfully',
                'newPublications': new_count,
                'updatedPublications': updated_count,
                'totalPublications': total_pubs
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error syncing Scopus publications: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Failed to sync publications from Scopus"
            )
    
    @staticmethod
    def get_publications(db: Session, user: User, skip: int = 0, limit: int = 100):
        """Get user's Scopus publications"""
        integration = ScopusService.get_scopus_integration(db, user)
        
        publications = db.query(ScopusPublication).filter(
            ScopusPublication.scopusIntegrationId == integration.id
        ).order_by(ScopusPublication.publicationDate.desc()).offset(skip).limit(limit).all()
        
        total = db.query(ScopusPublication).filter(
            ScopusPublication.scopusIntegrationId == integration.id
        ).count()
        
        return {
            'total': total,
            'publications': publications
        }
    
    @staticmethod
    def get_publication_by_id(db: Session, user: User, publication_id: int):
        """Get a specific Scopus publication"""
        integration = ScopusService.get_scopus_integration(db, user)
        
        publication = db.query(ScopusPublication).filter(
            ScopusPublication.id == publication_id,
            ScopusPublication.scopusIntegrationId == integration.id
        ).first() 
        
        if not publication:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Publication not found"
            )
        
        return publication
    
    @staticmethod
    def toggle_publication_posted(db: Session, user: User, publication_id: int, is_posted: bool):
        """Toggle whether a Scopus publication is posted to the platform"""
        publication = ScopusService.get_publication_by_id(db, user, publication_id)
        
        if is_posted:
            # Create a post from the publication
            post_content = f"{publication.title}\n\n"
            if publication.summary:
                post_content += publication.summary
            elif publication.abstract:
                post_content += publication.abstract
            
            # Check if a post already exists for this publication
            existing_post = db.query(Post).filter(
                Post.scopusPublicationId == publication_id,
                Post.userId == user.id
            ).first()
            
            if not existing_post:
                post = Post(
                    content=post_content,
                    userId=user.id,
                    scopusPublicationId=publication_id,
                    isPublic=False,
                    timestamp=datetime.datetime.now(datetime.timezone.utc)
                )
                db.add(post)
            else:
                existing_post.content = post_content
        else:
            # Delete the post associated with this publication
            post = db.query(Post).filter(
                Post.scopusPublicationId == publication_id,
                Post.userId == user.id
            ).first()
            
            if post:
                db.delete(post)
        
        publication.isPosted = is_posted
        db.commit()
        db.refresh(publication)
        
        return publication
    
    @staticmethod
    def delete_scopus_integration(db: Session, user: User):
        """Unlink Scopus account"""
        integration = db.query(ScopusIntegration).filter(
            ScopusIntegration.userId == user.id
        ).first()
        
        if not integration:
            return {'message': 'Scopus account unlinked successfully'}
        
        db.delete(integration)
        db.commit()
        
        return {'message': 'Scopus account unlinked successfully'}

