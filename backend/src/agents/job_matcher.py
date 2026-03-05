#!/usr/bin/env python3
"""
Job Matcher Agent
Encontra as melhores vagas para candidatos e os melhores candidatos para vagas.
"""

import os
import json
import logging
from typing import Dict, Any, List, Tuple
from datetime import datetime, timedelta
import asyncio
from supabase import create_client, Client

# Configuração
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class JobMatcher:
    """Agente para matching de vagas e candidatos"""
    
    def __init__(self):
        self.supabase = self._init_supabase()
        self.match_threshold = 70  # Score mínimo para considerar match
        self.max_matches_per_candidate = 5
        self.max_matches_per_job = 10
    
    def _init_supabase(self) -> Client:
        """Inicializa cliente Supabase"""
        supabase_url = os.getenv("SUPABASE_URL", "https://zluwxdsjtvqhguxdhsxm.supabase.co")
        supabase_key = os.getenv("SUPABASE_ANON_KEY", "sb_publishable_KTrHJtjUfFp9B6oHI1xSNQ_nMdhCqm1")
        
        return create_client(supabase_url, supabase_key)
    
    async def fetch_scored_candidates(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Busca candidatos com score calculado"""
        try:
            response = self.supabase.table("candidates")\
                .select("*")\
                .not_.is_("score", None)\
                .order("score", desc=True)\
                .limit(limit)\
                .execute()
            
            return response.data if response.data else []
        except Exception as e:
            logger.error(f"Erro ao buscar candidatos com score: {e}")
            return []
    
    async def fetch_active_jobs(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Busca vagas ativas"""
        try:
            response = self.supabase.table("jobs")\
                .select("*")\
                .eq("status", "active")\
                .order("created_at", desc=True)\
                .limit(limit)\
                .execute()
            
            return response.data if response.data else []
        except Exception as e:
            logger.error(f"Erro ao buscar vagas ativas: {e}")
            return []
    
    def calculate_match_score(self, candidate: Dict[str, Any], job: Dict[str, Any]) -> float:
        """Calcula score de match entre candidato e vaga"""
        try:
            candidate_score = candidate.get("score", 0)
            
            # Se já tem score calculado, usar como base
            if candidate_score >= 80:
                base_score = candidate_score
            else:
                base_score = 50  # Score neutro
            
            # Ajustar baseado em preferências
            adjustments = []
            
            # 1. Seniority match
            candidate_seniority = candidate.get("seniority", "").lower()
            job_seniority = job.get("seniority", "").lower()
            
            seniority_map = {"junior": 1, "mid": 2, "senior": 3, "lead": 4, "principal": 5}
            cand_level = seniority_map.get(candidate_seniority, 2)
            job_level = seniority_map.get(job_seniority, 2)
            
            if cand_level >= job_level:
                adjustments.append(10)  # Candidato tem senioridade suficiente ou superior
            else:
                adjustments.append(-20)  # Candidato júnior para vaga sênior
            
            # 2. Salary expectations
            candidate_salary = candidate.get("salary_expectation", 0)
            job_min = job.get("salary_range", {}).get("min", 0)
            job_max = job.get("salary_range", {}).get("max", float('inf'))
            
            if job_min <= candidate_salary <= job_max:
                adjustments.append(5)
            elif candidate_salary < job_min:
                adjustments.append(0)  # Pode ser aceitável
            else:
                adjustments.append(-15)  # Muito caro
            
            # 3. Location match
            candidate_location = candidate.get("location", "")
            job_locations = job.get("locations", [])
            
            if "remote" in job_locations:
                adjustments.append(10)  # Trabalho remoto
            elif candidate_location and any(loc.lower() in candidate_location.lower() for loc in job_locations):
                adjustments.append(15)  # Localização compatível
            else:
                adjustments.append(-10)  # Localização incompatível
            
            # 4. Skills overlap (simplificado)
            candidate_skills = set(candidate.get("skills", []))
            job_required = set(job.get("required_skills", []))
            job_preferred = set(job.get("preferred_skills", []))
            
            required_match = len(candidate_skills.intersection(job_required)) / len(job_required) if job_required else 1.0
            preferred_match = len(candidate_skills.intersection(job_preferred)) / len(job_preferred) if job_preferred else 0.5
            
            skills_score = (required_match * 0.7 + preferred_match * 0.3) * 20
            adjustments.append(skills_score)
            
            # Calcular score final
            total_adjustment = sum(adjustments)
            final_score = base_score + total_adjustment
            
            # Normalizar para 0-100
            return max(0, min(100, final_score))
            
        except Exception as e:
            logger.error(f"Erro ao calcular match score: {e}")
            return 0
    
    async def find_matches_for_candidate(self, candidate: Dict[str, Any], jobs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Encontra as melhores vagas para um candidato"""
        matches = []
        
        for job in jobs:
            match_score = self.calculate_match_score(candidate, job)
            
            if match_score >= self.match_threshold:
                match_data = {
                    "candidate_id": candidate["id"],
                    "job_id": job["id"],
                    "match_score": match_score,
                    "candidate_name": candidate.get("name", "Unknown"),
                    "job_title": job.get("title", "Unknown"),
                    "company_name": job.get("company_name", "Unknown"),
                    "match_type": "candidate_to_job",
                    "created_at": datetime.utcnow().isoformat()
                }
                matches.append(match_data)
        
        # Ordenar por score e limitar
        matches.sort(key=lambda x: x["match_score"], reverse=True)
        return matches[:self.max_matches_per_candidate]
    
    async def find_matches_for_job(self, job: Dict[str, Any], candidates: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Encontra os melhores candidatos para uma vaga"""
        matches = []
        
        for candidate in candidates:
            match_score = self.calculate_match_score(candidate, job)
            
            if match_score >= self.match_threshold:
                match_data = {
                    "candidate_id": candidate["id"],
                    "job_id": job["id"],
                    "match_score": match_score,
                    "candidate_name": candidate.get("name", "Unknown"),
                    "job_title": job.get("title", "Unknown"),
                    "company_name": job.get("company_name", "Unknown"),
                    "match_type": "job_to_candidate",
                    "created_at": datetime.utcnow().isoformat()
                }
                matches.append(match_data)
        
        # Ordenar por score e limitar
        matches.sort(key=lambda x: x["match_score"], reverse=True)
        return matches[:self.max_matches_per_job]
    
    async def save_matches(self, matches: List[Dict[str, Any]]) -> Tuple[int, int]:
        """Salva matches no banco de dados"""
        if not matches:
            return 0, 0
        
        success_count = 0
        error_count = 0
        
        for match in matches:
            try:
                # Verificar se match já existe
                existing = self.supabase.table("matches")\
                    .select("*")\
                    .eq("candidate_id", match["candidate_id"])\
                    .eq("job_id", match["job_id"])\
                    .execute()
                
                if existing.data:
                    # Atualizar match existente
                    response = self.supabase.table("matches")\
                        .update({
                            "match_score": match["match_score"],
                            "updated_at": datetime.utcnow().isoformat()
                        })\
                        .eq("candidate_id", match["candidate_id"])\
                        .eq("job_id", match["job_id"])\
                        .execute()
                else:
                    # Criar novo match
                    response = self.supabase.table("matches")\
                        .insert(match)\
                        .execute()
                
                if response.data:
                    success_count += 1
                else:
                    error_count += 1
                    
            except Exception as e:
                logger.error(f"Erro ao salvar match {match['candidate_id']}-{match['job_id']}: {e}")
                error_count += 1
        
        return success_count, error_count
    
    async def process_matching(self) -> Dict[str, Any]:
        """Processa matching entre candidatos e vagas"""
        start_time = datetime.utcnow()
        logger.info("Iniciando processamento de matching...")
        
        # Buscar dados
        candidates = await self.fetch_scored_candidates(100)
        jobs = await self.fetch_active_jobs(100)
        
        if not candidates or not jobs:
            logger.warning("Dados insuficientes para matching")
            return {"candidates": 0, "jobs": 0, "matches_found": 0, "matches_saved": 0}
        
        all_matches = []
        
        # Encontrar matches para cada candidato
        logger.info(f"Encontrando matches para {len(candidates)} candidatos...")
        for candidate in candidates:
            candidate_matches = await self.find_matches_for_candidate(candidate, jobs)
            all_matches.extend(candidate_matches)
        
        # Encontrar matches para cada vaga (perspectiva diferente)
        logger.info(f"Encontrando matches para {len(jobs)} vagas...")
        for job in jobs:
            job_matches = await self.find_matches_for_job(job, candidates)
            all_matches.extend(job_matches)
        
        # Remover duplicatas
        unique_matches = {}
        for match in all_matches:
            key = f"{match['candidate_id']}-{match['job_id']}"
            if key not in unique_matches or match['match_score'] > unique_matches[key]['match_score']:
                unique_matches[key] = match
        
        unique_matches_list = list(unique_matches.values())
        
        # Salvar matches
        logger.info(f"Salvando {len(unique_matches_list)} matches únicos...")
        saved, errors = await self.save_matches(unique_matches_list)
        
        elapsed = (datetime.utcnow() - start_time).total_seconds()
        
        results = {
            "candidates_processed": len(candidates),
            "jobs_processed": len(jobs),
            "matches_found": len(unique_matches_list),
            "matches_saved": saved,
            "match_errors": errors,
            "processing_time": elapsed,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        logger.info(f"Matching concluído: {results}")
        return results
    
    async def get_match_statistics(self) -> Dict[str, Any]:
        """Obtém estatísticas de matching"""
        try:
            # Total de matches
            matches_response = self.supabase.table("matches")\
                .select("count", count="exact")\
                .execute()
            
            # Matches por score
            high_matches = self.supabase.table("matches")\
                .select("count", count="exact")\
                .gte("match_score", 80)\
                .execute()
            
            medium_matches = self.supabase.table("matches")\
                .select("count", count="exact")\
                .gte("match_score", 60)\
                .lt("match_score", 80)\
                .execute()
            
            # Últimos matches
            recent_matches = self.supabase.table("matches")\
                .select("*")\
                .order("created_at", desc=True)\
                .limit(5)\
                .execute()
            
            return {
                "total_matches": matches_response.count or 0,
                "high_quality_matches": high_matches.count or 0,
                "medium_quality_matches": medium_matches.count or 0,
                "recent_matches": recent_matches.data or [],
                "last_updated": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Erro ao obter estatísticas: {e}")
            return {}

async def main():
    """Função principal para execução standalone"""
    matcher = JobMatcher()
    
    print("🤝 Job Matcher Agent - TalonHire")
    print("=" * 50)
    
    # Testar conexão
    print("🔗 Testando conexão com Supabase...")
    try:
        test_response = matcher.supabase.table("matches").select("count", count="exact").execute()
        print(f"✅ Conectado. Matches na base: {test_response.count}")
    except Exception as e:
        print(f"❌ Erro de conexão: {e}")
        return
    
    # Obter estatísticas
    print("\n📊 Estatísticas atuais:")
    stats = await matcher.get_match_statistics()
    print(f"  Total de matches: {stats.get('total_matches', 0)}")
    print(f"  High quality (80+): {stats.get('high_quality_matches', 0)}")
    print(f"  Medium quality (60-80): {stats.get('medium_quality_matches', 0)}")
    
    # Processar matching
    print("\n🔄 Processando matching...")
    results = await matcher.process_matching()
    
    print(f"\n📊 Resultados do matching:")
    print(f"  Candidatos processados: {results['candidates_processed']}")
    print(f"  Vagas processadas: {results['jobs_processed']}")
    print(f"  Matches encontrados: {results['matches_found']}")
    print(f"  Matches salvos: {results['matches_saved']}")
    print(f"  Erros: {results['match_errors']}")
    print(f"  Tempo: {results['processing_time']:.2f}s")
    
    # Mostrar matches recentes
    if stats.get('recent_matches'):
        print("\n🎯 Matches recentes:")
        for match in stats['recent_matches'][:3]:
            print(f"  • {match.get('candidate_name')} ↔ {match.get('job_title')} ({match.get('match_score')}/100)")

if __name__ == "__main__":
    asyncio.run(main())