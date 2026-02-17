import { useMemo } from 'react';
import { UserPreferences } from './use-user-preferences';

interface UseMatchScoreProps {
    job: any;
    preferences: UserPreferences | null;
}

interface MatchScoreResult {
    score: number; // 0 to 100
    breakdown: {
        titleMatch: boolean;
        locationMatch: boolean;
        industryMatch: boolean;
        nocMatch: boolean;
        teerMatch: boolean;
    };
    color: string; // 'green' | 'yellow' | 'red' | 'gray'
    label: string; // 'High Match' | 'Medium Match' | 'Low Match' | 'No Match'
}

export function useMatchScore({ job, preferences }: UseMatchScoreProps): MatchScoreResult {
    return useMemo(() => {
        if (!preferences || !job) {
            return {
                score: 0,
                breakdown: {
                    titleMatch: false,
                    locationMatch: false,
                    industryMatch: false,
                    nocMatch: false,
                    teerMatch: false,
                },
                color: 'gray',
                label: 'No Match',
            };
        }

        let score = 0;
        const breakdown = {
            titleMatch: false,
            locationMatch: false,
            industryMatch: false,
            nocMatch: false,
            teerMatch: false,
        };

        // 1. Job Title Match (Weight: 40%)
        const jobTitle = (job.job_title || job.JobTitle || '').toLowerCase();
        if (preferences.preferred_job_titles?.length > 0) {
            const match = preferences.preferred_job_titles.some((prefTitle) =>
                jobTitle.includes(prefTitle.replace(/_/g, ' ').toLowerCase())
            );
            if (match) {
                score += 40;
                breakdown.titleMatch = true;
            }
        }

        // 2. Location Match (Weight: 10%)
        const jobCity = (job.City || job.city || '').toLowerCase();
        const jobProvince = (job.Province || job.province || '').toLowerCase();

        // Check Cities
        const cityMatch = preferences.preferred_cities?.some((city) =>
            jobCity.includes(city.toLowerCase())
        );

        // Check Provinces
        const provinceMatch = preferences.preferred_provinces?.some((prov) =>
            jobProvince.includes(prov.toLowerCase())
        );

        if (cityMatch || provinceMatch) {
            score += 10;
            breakdown.locationMatch = true;
        }

        // 3. Industry Match (Weight: 20%)
        const jobIndustry = (job.industry || job.NAICS_Title || '').toLowerCase();
        if (preferences.preferred_industries?.length > 0) {
            const match = preferences.preferred_industries.some((ind) =>
                jobIndustry.includes(ind.toLowerCase())
            );
            if (match) {
                score += 20;
                breakdown.industryMatch = true;
            }
        }

        // 4. NOC Code Match (Weight: 20%)
        const jobNoc = String(job.NOC || job.noc || '');
        if (preferences.preferred_noc_codes?.length > 0) {
            if (preferences.preferred_noc_codes.includes(jobNoc)) {
                score += 20;
                breakdown.nocMatch = true;
            }
        }

        // 5. TEER Match (Weight: 10%)
        // Try to find TEER or infer from NOC
        let jobTeer = String(job.Teer || job.teer || '');
        if (!jobTeer && jobNoc.length === 5) {
            jobTeer = jobNoc.charAt(1);
        }

        if (preferences.preferred_teer_categories?.length > 0) {
            if (preferences.preferred_teer_categories.includes(jobTeer)) {
                score += 10;
                breakdown.teerMatch = true;
            }
        }

        // Determine Color and Label
        let color = 'gray';
        let label = 'No Match';

        if (score >= 80) {
            color = 'green';
            label = 'High Match';
        } else if (score >= 50) {
            color = 'yellow';
            label = 'Medium Match';
        } else if (score > 0) {
            color = 'red'; // or orange
            label = 'Low Match';
        }

        return { score, breakdown, color, label };
    }, [job, preferences]);
}
