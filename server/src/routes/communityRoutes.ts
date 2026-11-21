import { Router, Request, Response } from 'express';

const router = Router();

export interface CommunityPledge {
  id: string;
  title: string;
  description: string;
  category: 'transit' | 'awareness' | 'household' | 'reporting';
  co2SavingsEstimateKgPerWeek?: number;
  participantsCount: number;
  badge: string;
}

// In-memory community action tracking state (seeded with realistic community commitments)
let communityState: {
  pledges: CommunityPledge[];
  totalActionsCompletedThisWeek: number;
  totalKgCo2SavedThisWeek: number;
  openBurningReportsLogged: number;
} = {
  pledges: [
    {
      id: 'pledge_carpool_metro',
      title: 'Metro / Carpool 3 Days a Week',
      description: 'Pledge to leave solo personal cars behind at least 3 days every week during peak winter smog.',
      category: 'transit',
      co2SavingsEstimateKgPerWeek: 14.5,
      participantsCount: 428,
      badge: '🚇 Transit Champion'
    },
    {
      id: 'pledge_zero_idling',
      title: 'Zero-Idling School & Market Zones',
      description: 'Turn off vehicle ignition whenever parked or waiting outside schools, red lights > 20s, and markets.',
      category: 'awareness',
      co2SavingsEstimateKgPerWeek: 3.2,
      participantsCount: 685,
      badge: '🛑 Clean Idle Guardian'
    },
    {
      id: 'pledge_wet_mop_only',
      title: 'Wet Mopping Shield (No Dry Sweeping)',
      description: 'Commit to damp microfiber wiping and wet mopping at home and workplace to eliminate dust resuspension.',
      category: 'household',
      participantsCount: 890,
      badge: '🧹 Clean Floor Pioneer'
    },
    {
      id: 'pledge_no_open_burning',
      title: 'Zero Waste Burning Watchdog',
      description: 'Pledge never to burn leaves, plastics, or garbage, and actively report local open burning to authorities.',
      category: 'reporting',
      participantsCount: 512,
      badge: '🔥 Burning Watchdog'
    },
    {
      id: 'pledge_smokeless_cooking',
      title: 'Induction / Clean Fuel Transition',
      description: 'Shift away from biomass or open flame cooking and eliminate indoor incense and mosquito coil use.',
      category: 'household',
      participantsCount: 320,
      badge: '🍲 Clean Kitchen Guardian'
    }
  ],
  totalActionsCompletedThisWeek: 2835,
  totalKgCo2SavedThisWeek: 9420,
  openBurningReportsLogged: 64
};

/**
 * Open Waste Burning & Incident Reporting Guidance
 */
export const OPEN_BURNING_REPORT_GUIDE = {
  title: 'How to Report Open Waste & Leaf Burning',
  legalContext: 'Open burning of municipal solid waste, biomass, plastic, or leaves is strictly prohibited under the Air (Prevention and Control of Pollution) Act and National Green Tribunal (NGT) directives, attracting penalties up to ₹25,000.',
  actionSteps: [
    {
      step: 1,
      title: 'Download Official CPCB SAMEER App',
      details: 'Central Pollution Control Board (CPCB) provides the official "SAMEER" mobile app (Android & iOS). You can snap a geotagged photo of open burning, garbage fire, or construction dust and submit directly to municipal nodal officers.'
    },
    {
      step: 2,
      title: 'Call Municipal Control Room Helpline',
      details: 'In Delhi NCR: Call MCD Control Room at 155304 or Delhi Police Pollution Helpline at 1095. In Mumbai: MCGM Disaster Helpline 1916. In Bengaluru: BBMP Control Room 080-22660000.'
    },
    {
      step: 3,
      title: 'Document with Time & GPS Coordinates',
      details: 'Take clear photographs showing the fire plume and nearby landmarks. Record the exact address or GPS pin.'
    },
    {
      step: 4,
      title: 'Tag State Pollution Control Boards on Social Media',
      details: 'Post verified geotagged photos tagging your city municipal corporation and State Pollution Control Board handles on X/Twitter with #CleanAirNow and #AirPollution.'
    }
  ],
  safetyPrecaution: 'Do not approach active hazardous plastic fires without an N95 respirator. Keep children and vulnerable family members inside and upwind.'
};

/**
 * GET /api/community/board
 */
router.get('/board', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: communityState,
    reportGuide: OPEN_BURNING_REPORT_GUIDE
  });
});

/**
 * POST /api/community/pledge
 * Join a community pledge
 */
router.post('/pledge', (req: Request, res: Response) => {
  const { pledgeId } = req.body;
  const pledge = communityState.pledges.find(p => p.id === pledgeId);

  if (!pledge) {
    res.status(404).json({ success: false, error: 'Pledge not found' });
    return;
  }

  pledge.participantsCount += 1;
  communityState.totalActionsCompletedThisWeek += 1;
  if (pledge.co2SavingsEstimateKgPerWeek) {
    communityState.totalKgCo2SavedThisWeek += Math.round(pledge.co2SavingsEstimateKgPerWeek);
  }

  res.json({
    success: true,
    message: `Thank you for joining: "${pledge.title}"!`,
    updatedPledge: pledge,
    totalCommunityActions: communityState.totalActionsCompletedThisWeek
  });
});

/**
 * POST /api/community/report-incident
 * Log a local incident report
 */
router.post('/report-incident', (req: Request, res: Response) => {
  const { city, locationName, incidentType } = req.body;

  communityState.openBurningReportsLogged += 1;
  communityState.totalActionsCompletedThisWeek += 1;

  res.json({
    success: true,
    message: `Incident recorded in community register for ${city || 'your area'}. Please submit officially via CPCB SAMEER App for immediate nodal dispatch.`,
    totalReportsLogged: communityState.openBurningReportsLogged
  });
});

export default router;
