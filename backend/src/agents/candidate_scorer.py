#!/usr/bin/env python3
"""
Candidate Scorer Agent
Calcula scores para candidatos baseado em skills, experiência, fit cultural, etc.
"""

import os
import json
import logging
from typing import Dict, Any, List
from datetime import datetime
import asyncio
from supabase import create_client, Client

# Configuração
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CandidateScorer:
    """Agente para scoring de candidatos"""
    
    def __init__(self):
        self.supabase = self._init_supabase()
        self.scoring_weights = {
            "skills_match": 0.35,
            "experience_level": 0.25,
            "cultural_fit": 0.20,
            "salary_expectations": 0.10,
            "location_flexibility": 0.05,
            "availability": 0.05
        }
    
    def _init_supabase(self) -> Client:
        """Inicializa cliente Supabase"""
        supabase_url = os.getenv("SUPABASE_URL", "https://zluwxdsjtvqhguxdhsxm.supabase.co")
        supabase_key = os.getenv("SUPABASE_ANON_KEY", "sb_publishable_KTrHJtjUfFp9B6oHI1xSNQ_nMdhCqm1")
        
        return create_client(supabase_url, supabase_key)
    
    async def fetch_candidates(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Busca candidatos pendentes de scoring"""
        try:
            response = self.supabase.table("candidates")\
                .select("*")\
                .is_("score", None)\
                .limit(limit)\
                .execute()
            
            return response.data if response.data else []
        except Exception as e:
            logger.error(f"Erro ao buscar candidatos: {e}")
            return []
    
    async def fetch_job(self, job_id: str) -> Dict[str, Any]:
        """Busca detalhes de uma vaga"""
        try:
            response = self.supabase.table("jobs")\
                .select("*")\
                .eq("id", job_id)\
                .single()\
                .execute()
            
            return response.data if response.data else {}
        except Exception as e:
            logger.error(f"Erro ao buscar vaga {job_id}: {e}")
            return {}
    
    def calculate_skills_score(self, candidate_skills: List[str], job_skills: List[str]) -> float:
        """Calcula score de match de skills"""
        if not job_skills:
            return 0.5  # Score neutro se não há skills definidas
        
        candidate_skills_set = set(candidate_skills)
        job_skills_set = set(job_skills)
        
        # Skills obrigatórias
        required_skills = job_skills_set.intersection(candidate_skills_set)
        required_match = len(required_skills) / len(job_skills_set) if job_skills_set else 0
        
        # Skills bonus (candidato tem skills extras)
        bonus_skills = candidate_skills_set - job_skills_set
        bonus_factor = min(len(bonus_skills) * 0.05, 0.2)  # Máximo 20% bonus
        
        return min(required_match + bonus_factor, 1.0)
    
    def calculate_experience_score(self, candidate_exp: int, job_min_exp: int) -> float:
        """Calcula score baseado em experiência"""
        if candidate_exp >= job_min_exp:
            # Experiência suficiente ou superior
            exp_ratio = candidate_exp / max(job_min_exp, 1)
            if exp_ratio <= 2.0:
                return min(exp_ratio / 2.0, 1.0)  # Linear até 2x a experiência
            else:
                return 1.0  # Máximo para muito experiente
        else:
            # Experiência insuficiente
            return candidate_exp / max(job_min_exp, 1) * 0.5  # Penalizado
    
    def calculate_cultural_fit_score(self, candidate_values: List[str], company_values: List[str]) -> float:
        """Calcula score de fit cultural"""
        if not company_values:
            return 0.5
        
        candidate_values_set = set(candidate_values)
        company_values_set = set(company_values)
        
        match_count = len(candidate_values_set.intersection(company_values_set))
        return match_count / len(company_values_set) if company_values_set else 0.5
    
    def calculate_salary_score(self, candidate_salary: float, job_salary_range: Dict[str, float]) -> float:
        """Calcula score baseado em expectativa salarial"""
        min_salary = job_salary_range.get("min", 0)
        max_salary = job_salary_range.get("max", float('inf'))
        
        if min_salary <= candidate_salary <= max_salary:
            # Dentro do range ideal
            range_mid = (min_salary + max_salary) / 2
            deviation = abs(candidate_salary - range_mid) / max(range_mid, 1)
            return max(0.8 - deviation, 0.5)  # Entre 0.5 e 0.8
        elif candidate_salary < min_salary:
            # Abaixo do mínimo (pode ser júnior ou subvalorizado)
            return 0.6
        else:
            # Acima do máximo (pode ser overqualified)
            excess_ratio = (candidate_salary - max_salary) / max(max_salary, 1)
            return max(0.4 - excess_ratio * 0.2, 0.1)  # Penalizado
    
    def calculate_location_score(self, candidate_location: str, job_locations: List[str]) -> float:
        """Calcula score baseado em localização"""
        if not job_locations or "remote" in job_locations:
            return 1.0  # Trabalho remoto ou sem restrições
        
        candidate_country = candidate_location.split(",")[-1].strip() if "," in candidate_location else candidate_location
        
        for location in job_locations:
            if candidate_country in location or location in candidate_location:
                return 1.0  # Match de país ou cidade
        
        return 0.3  # Penalizado por localização diferente
    
    def calculate_availability_score(self, candidate_availability: str) -> float:
        """Calcula score baseado em disponibilidade"""
        availability_map = {
            "immediate": 1.0,
            "1_month": 0.8,
            "3_months": 0.6,
            "6_months": 0.4,
            "flexible": 0.7
        }
        return availability_map.get(candidate_availability.lower(), 0.5)
    
    def calculate_total_score(self, scores: Dict[str, float]) -> Dict[str, Any]:
        """Calcula score total e breakdown"""
        weighted_score = sum(
            scores[category] * weight 
            for category, weight in self.scoring_weights.items() 
            if category in scores
        )
        
        return {
            "total_score": round(weighted_score * 100, 2),  # 0-100 scale
            "score_breakdown": scores,
            "weights": self.scoring_weights,
            "calculated_at": datetime.utcnow().isoformat()
        }
    
    async def score_candidate(self, candidate: Dict[str, Any], job: Dict[str, Any]) -> Dict[str, Any]:
        """Calcula score completo para um candidato"""
        try:
            # Extrair dados
            candidate_skills = candidate.get("skills", [])
            candidate_exp = candidate.get("years_experience", 0)
            candidate_values = candidate.get("cultural_values", [])
            candidate_salary = candidate.get("salary_expectation", 0)
            candidate_location = candidate.get("location", "")
            candidate_availability = candidate.get("availability", "flexible")
            
            job_skills = job.get("required_skills", []) + job.get("preferred_skills", [])
            job_min_exp = job.get("min_experience", 0)
            company_values = job.get("company_values", [])
            job_salary_range = job.get("salary_range", {"min": 0, "max": float('inf')})
            job_locations = job.get("locations", [])
            
            # Calcular scores individuais
            scores = {
                "skills_match": self.calculate_skills_score(candidate_skills, job_skills),
                "experience_level": self.calculate_experience_score(candidate_exp, job_min_exp),
                "cultural_fit": self.calculate_cultural_fit_score(candidate_values, company_values),
                "salary_expectations": self.calculate_salary_score(candidate_salary, job_salary_range),
                "location_flexibility": self.calculate_location_score(candidate_location, job_locations),
                "availability": self.calculate_availability_score(candidate_availability)
            }
            
            # Calcular score total
            result = self.calculate_total_score(scores)
            
            logger.info(f"Score calculado para candidato {candidate.get('id')}: {result['total_score']}/100")
            return result
            
        except Exception as e:
            logger.error(f"Erro ao calcular score para candidato {candidate.get('id')}: {e}")
            return {
                "total_score": 0,
                "score_breakdown": {},
                "error": str(e),
                "calculated_at": datetime.utcnow().isoformat()
            }
    
    async def update_candidate_score(self, candidate_id: str, score_data: Dict[str, Any]) -> bool:
        """Atualiza score do candidato no banco de dados"""
        try:
            update_data = {
                "score": score_data["total_score"],
                "score_breakdown": score_data["score_breakdown"],
                "score_calculated_at": score_data["calculated_at"],
                "last_scored_at": datetime.utcnow().isoformat()
            }
            
            response = self.supabase.table("candidates")\
                .update(update_data)\
                .eq("id", candidate_id)\
                .execute()
            
            success = response.data is not None
            if success:
                logger.info(f"Score atualizado para candidato {candidate_id}")
            else:
                logger.warning(f"Falha ao atualizar score para candidato {candidate_id}")
            
            return success
            
        except Exception as e:
            logger.error(f"Erro ao atualizar score do candidato {candidate_id}: {e}")
            return False
    
    async def process_batch(self, batch_size: int = 10) -> Dict[str, Any]:
        """Processa um batch de candidatos"""
        start_time = datetime.utcnow()
        logger.info(f"Iniciando processamento de batch (tamanho: {batch_size})")
        
        # Buscar candidatos
        candidates = await self.fetch_candidates(batch_size)
        if not candidates:
            logger.info("Nenhum candidato pendente de scoring")
            return {"processed": 0, "success": 0, "failed": 0}
        
        results = {"processed": 0, "success": 0, "failed": 0}
        
        for candidate in candidates:
            try:
                # Buscar vaga associada
                job_id = candidate.get("job_id")
                if not job_id:
                    logger.warning(f"Candidato {candidate.get('id')} sem job_id")
                    continue
                
                job = await self.fetch_job(job_id)
                if not job:
                    logger.warning(f"Vaga {job_id} não encontrada para candidato {candidate.get('id')}")
                    continue
                
                # Calcular score
                score_result = await self.score_candidate(candidate, job)
                
                # Atualizar banco de dados
                if "total_score" in score_result:
                    success = await self.update_candidate_score(candidate["id"], score_result)
                    if success:
                        results["success"] += 1
                    else:
                        results["failed"] += 1
                else:
                    results["failed"] += 1
                
                results["processed"] += 1
                
                # Pequena pausa para não sobrecarregar
                await asyncio.sleep(0.1)
                
            except Exception as e:
                logger.error(f"Erro ao processar candidato {candidate.get('id')}: {e}")
                results["failed"] += 1
                results["processed"] += 1
        
        elapsed = (datetime.utcnow() - start_time).total_seconds()
        logger.info(f"Batch processado: {results['processed']} candidatos, {results['success']} sucessos, {results['failed']} falhas em {elapsed:.2f}s")
        
        return results

async def main():
    """Função principal para execução standalone"""
    scorer = CandidateScorer()
    
    print("🎯 Candidate Scorer Agent - TalonHire")
    print("=" * 50)
    
    # Testar conexão
    print("🔗 Testando conexão com Supabase...")
    try:
        test_response = scorer.supabase.table("candidates").select("count", count="exact").execute()
        print(f"✅ Conectado. Candidatos na base: {test_response.count}")
    except Exception as e:
        print(f"❌ Erro de conexão: {e}")
        return
    
    # Processar batch
    print("\n🔄 Processando batch de candidatos...")
    results = await scorer.process_batch(5)
    
    print(f"\n📊 Resultados:")
    print(f"  Processados: {results['processed']}")
    print(f"  Sucessos: {results['success']}")
    print(f"  Falhas: {results['failed']}")
    
    if results['processed'] == 0:
        print("\n💡 Dica: Adicione candidatos e vagas no Supabase para testar o scoring.")

if __name__ == "__main__":
    asyncio.run(main())