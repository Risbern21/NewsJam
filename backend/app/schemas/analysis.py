from pydantic import BaseModel
from uuid import UUID


class AnalysisBase(BaseModel):
    user_id:UUID
    post_id:UUID
    credibility_score:int

class AnalysisRead(AnalysisBase):
    id:UUID