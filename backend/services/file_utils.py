"""
Utility functions for file validation and malware detection integration
"""

from pathlib import Path
import os

UPLOAD_DIR = Path(__file__).parent.parent / "uploads"


def get_file_path_from_url(attachment_url: str) -> Path | None:
    """
    Safely convert upload URL to file path.
    
    Args: 
        attachment_url: URL like "/upload/files/uuid.ext"
    
    Returns:
        Validated file path or None if invalid
    """
    if not attachment_url:
        return None
    
    try:
        # Extract filename safely
        filename = Path(attachment_url).name
        
        # Prevent directory traversal attacks
        if ".." in filename or "/" in filename or "\\" in filename:
            return None
        
        file_path = UPLOAD_DIR / filename
        
        # Verify the resolved path is within UPLOAD_DIR
        try:
            file_path.relative_to(UPLOAD_DIR)
        except ValueError:
            # Path is outside upload directory
            return None
        
        return file_path if file_path.exists() else None
    
    except Exception:
        return None


def validate_attachment_url(attachment_url: str) -> bool:
    """
    Quick validation that attachment URL points to valid uploaded file.
    
    Args:
        attachment_url: URL like "/upload/files/uuid.ext"
    
    Returns:
        True if valid, False otherwise
    """
    return get_file_path_from_url(attachment_url) is not None


def delete_file_from_url(attachment_url: str) -> bool:
    """
    Delete a file from the uploads directory given its URL.

    Returns:
        True if deleted, False if not found or not deletable.
    """
    file_path = get_file_path_from_url(attachment_url)
    if not file_path:
        return False

    try:
        if file_path.exists() and file_path.is_file():
            file_path.unlink()
            return True
    except Exception:
        return False

    return False
