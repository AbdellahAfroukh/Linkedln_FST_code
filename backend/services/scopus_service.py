import httpx
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from models.scopus import ScopusPublication, ScopusProfile
from models.user import User
from fastapi import HTTPException
from typing import List, Optional, Dict
import datetime
from config import settings  # Import settings


class ScopusService:
    BASE_URL = settings.SCOPUS_BASE_URL
    DEFAULT_API_KEY = settings.SCOPUS_API_KEY
    
    @staticmethod
    async def fetch_author_profile(author_id: str, api_key: Optional[str] = None) -> Dict:
        """Fetch author profile from Scopus API"""
        # Use provided API key or fall back to default
        key = api_key or ScopusService.DEFAULT_API_KEY
        
        url = f"{ScopusService.BASE_URL}/author/author_id/{author_id}"
        headers = {
            "X-ELS-APIKey": key,
            "Accept": "application/json"
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.get(url, headers=headers)
                if response.status_code == 200:
                    return response.json()
                elif response.status_code == 404:
                    raise HTTPException(
                        status_code=404,
                        detail="Author ID not found in Scopus"
                    )
                elif response.status_code == 401:
                    raise HTTPException(
                        status_code=401,
                        detail="Invalid Scopus API key"
                    )
                elif response.status_code == 429:
                    raise HTTPException(
                        status_code=429,
                        detail="Scopus API rate limit exceeded. Please try again later."
                    )
                else:
                    raise HTTPException(
                        status_code=response.status_code,
                        detail=f"Scopus API error: {response.text}"
                    )
            except httpx.TimeoutException:
                raise HTTPException(
                    status_code=504,
                    detail="Scopus API request timeout"
                )
            except HTTPException:
                raise
            except Exception as e:
                raise HTTPException(
                    status_code=500,
                    detail=f"Error fetching Scopus profile: {str(e)}"
                )
    
    @staticmethod
    async def fetch_author_documents(author_id: str, api_key: Optional[str] = None, count: int = 200) -> Dict:
        """Fetch documents by author from Scopus API"""
        # Use provided API key or fall back to default
        key = api_key or ScopusService.DEFAULT_API_KEY
        
        url = f"{ScopusService.BASE_URL}/search/scopus"
        headers = {
            "X-ELS-APIKey": key,
            "Accept": "application/json"
        }
        params = {
            "query": f"AU-ID({author_id})",
            "count": count,
            "sort": "-coverDate",
            "field": "dc:identifier,eid,dc:title,dc:creator,prism:publicationName,prism:volume,prism:issueIdentifier,prism:pageRange,prism:coverDate,prism:doi,citedby-count,subtypeDescription,openaccess,affiliation"
        }
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            try:
                response = await client.get(url, headers=headers, params=params)
                if response.status_code == 200:
                    return response.json()
                elif response.status_code == 401:
                    raise HTTPException(
                        status_code=401,
                        detail="Invalid Scopus API key"
                    )
                elif response.status_code == 429:
                    raise HTTPException(
                        status_code=429,
                        detail="Scopus API rate limit exceeded. Please try again later."
                    )
                else:
                    raise HTTPException(
                        status_code=response.status_code,
                        detail=f"Scopus API error: {response.text}"
                    )
            except httpx.TimeoutException:
                raise HTTPException(
                    status_code=504,
                    detail="Scopus API request timeout"
                )
            except HTTPException:
                raise
            except Exception as e:
                raise HTTPException(
                    status_code=500,
                    detail=f"Error fetching Scopus documents: {str(e)}"
                )
    
    @staticmethod
    def save_profile(db: Session, user: User, profile_data: Dict, author_id: str) -> ScopusProfile:
        """Save or update Scopus profile"""
        existing_profile = db.query(ScopusProfile).filter(
            ScopusProfile.userId == user.id
        ).first()
        
        # Parse profile data
        author_response = profile_data.get("author-retrieval-response", [])
        if isinstance(author_response, list) and len(author_response) > 0:
            author_data = author_response[0]
        else:
            author_data = author_response
        
        coredata = author_data.get("coredata", {})
        h_index_val = author_data.get("h-index")
        
        profile_info = {
            "author_id": author_id,
            "h_index": int(h_index_val) if h_index_val else 0,
            "citation_count": int(coredata.get("citation-count", 0)),
            "document_count": int(coredata.get("document-count", 0)),
            "affiliation": "",
            "subject_areas": "",
            "last_sync": datetime.date.today()
        }
        
        # Get affiliation
        affiliation_current = author_data.get("affiliation-current")
        if affiliation_current:
            if isinstance(affiliation_current, dict):
                profile_info["affiliation"] = affiliation_current.get("affiliation-name", "")
            elif isinstance(affiliation_current, list) and len(affiliation_current) > 0:
                profile_info["affiliation"] = affiliation_current[0].get("affiliation", {}).get("affiliation-name", "")
        
        # Get subject areas
        subject_areas_data = author_data.get("subject-areas", {}).get("subject-area", [])
        if subject_areas_data:
            areas = [area.get("$", "") for area in subject_areas_data if isinstance(area, dict)]
            profile_info["subject_areas"] = ", ".join(areas)
        
        if existing_profile:
            for key, value in profile_info.items():
                setattr(existing_profile, key, value)
            existing_profile.dateModification = datetime.date.today()
            db.commit()
            db.refresh(existing_profile)
            return existing_profile
        else:
            new_profile = ScopusProfile(
                userId=user.id,
                dateCreation=datetime.date.today(),
                **profile_info
            )
            db.add(new_profile)
            db.commit()
            db.refresh(new_profile)
            return new_profile
    
    @staticmethod
    def save_publications(db: Session, user: User, documents_data: Dict) -> List[ScopusPublication]:
        """Save or update Scopus publications"""
        entries = documents_data.get("search-results", {}).get("entry", [])
        saved_publications = []
        
        for entry in entries:
            # Skip if no valid identifier
            identifier = entry.get("dc:identifier", "")
            if not identifier:
                continue
                
            scopus_id = identifier.replace("SCOPUS_ID:", "")
            
            # Check if publication already exists
            existing_pub = db.query(ScopusPublication).filter(
                ScopusPublication.scopus_id == scopus_id
            ).first()
            
            # Parse date
            cover_date_str = entry.get("prism:coverDate")
            cover_date = None
            if cover_date_str:
                try:
                    cover_date = datetime.datetime.strptime(cover_date_str, "%Y-%m-%d").date()
                except:
                    try:
                        cover_date = datetime.datetime.strptime(cover_date_str, "%Y-%m").date()
                    except:
                        pass
            
            # Get authors
            authors = entry.get("dc:creator", "")
            author_list = entry.get("author", [])
            if author_list and isinstance(author_list, list):
                authors = ", ".join([a.get("authname", "") for a in author_list[:10]])  # First 10 authors
            
            # Get affiliation
            affiliation = ""
            affiliation_data = entry.get("affiliation", [])
            if affiliation_data:
                if isinstance(affiliation_data, list) and len(affiliation_data) > 0:
                    affiliation = affiliation_data[0].get("affilname", "")
                elif isinstance(affiliation_data, dict):
                    affiliation = affiliation_data.get("affilname", "")
            
            pub_data = {
                "scopus_id": scopus_id,
                "eid": entry.get("eid", ""),
                "title": entry.get("dc:title", "Unknown Title"),
                "authors": authors,
                "publication_name": entry.get("prism:publicationName", ""),
                "volume": entry.get("prism:volume", ""),
                "issue": entry.get("prism:issueIdentifier", ""),
                "pages": entry.get("prism:pageRange", ""),
                "cover_date": cover_date,
                "doi": entry.get("prism:doi", ""),
                "citation_count": int(entry.get("citedby-count", 0)),
                "document_type": entry.get("subtypeDescription", ""),
                "open_access": str(entry.get("openaccess", "")),
                "affiliation": affiliation,
            }
            
            if existing_pub:
                # Update existing publication
                for key, value in pub_data.items():
                    setattr(existing_pub, key, value)
                existing_pub.dateModification = datetime.date.today()
                db.commit()
                db.refresh(existing_pub)
                saved_publications.append(existing_pub)
            else:
                # Create new publication
                new_pub = ScopusPublication(
                    userId=user.id,
                    dateCreation=datetime.date.today(),
                    **pub_data
                )
                db.add(new_pub)
                db.commit()
                db.refresh(new_pub)
                saved_publications.append(new_pub)
        
        return saved_publications
    
    @staticmethod
    def get_user_profile(db: Session, user: User) -> Optional[ScopusProfile]:
        """Get user's Scopus profile"""
        return db.query(ScopusProfile).filter(
            ScopusProfile.userId == user.id
        ).first()
    
    @staticmethod
    def get_user_publications(db: Session, user: User, limit: Optional[int] = None) -> List[ScopusPublication]:
        """Get user's Scopus publications"""
        query = db.query(ScopusPublication).filter(
            ScopusPublication.userId == user.id
        ).order_by(ScopusPublication.cover_date.desc())
        
        if limit:
            query = query.limit(limit)
        
        return query.all()
    
    @staticmethod
    def get_user_stats(db: Session, user: User) -> Dict:
        """Get statistics for user's Scopus data"""
        profile = ScopusService.get_user_profile(db, user)
        publications = db.query(ScopusPublication).filter(
            ScopusPublication.userId == user.id
        ).all()
        
        total_publications = len(publications)
        total_citations = sum(pub.citation_count for pub in publications)
        
        # Publications in last 2 years
        two_years_ago = datetime.date.today() - datetime.timedelta(days=730)
        recent_publications = db.query(ScopusPublication).filter(
            ScopusPublication.userId == user.id,
            ScopusPublication.cover_date >= two_years_ago
        ).count()
        
        # Average citations per paper
        avg_citations = total_citations / total_publications if total_publications > 0 else 0
        
        return {
            "total_publications": total_publications,
            "total_citations": total_citations,
            "h_index": profile.h_index if profile else 0,
            "recent_publications": recent_publications,
            "avg_citations_per_paper": round(avg_citations, 2)
        }
    
    @staticmethod
    def delete_user_scopus_data(db: Session, user: User) -> bool:
        """Delete all Scopus data for a user"""
        try:
            # Delete publications
            db.query(ScopusPublication).filter(
                ScopusPublication.userId == user.id
            ).delete()
            
            # Delete profile
            db.query(ScopusProfile).filter(
                ScopusProfile.userId == user.id
            ).delete()
            
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=500,
                detail=f"Error deleting Scopus data: {str(e)}"
            )