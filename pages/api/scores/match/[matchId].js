import axios from 'axios';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { matchId } = req.query;

    if (!matchId) {
        return res.status(400).json({ error: 'Match ID is required' });
    }

    try {
        const response = await axios.get(`https://drop.urtechy.com/api/cricket/scorecard/${matchId}`, {
            timeout: 8000
        });

        // Cache Control
        res.setHeader(
            'Cache-Control',
            'public, s-maxage=5, stale-while-revalidate=15'
        );

        // Upstream returns { success: true, matchId, data: {...} } so we pass it through
        return res.status(200).json(response.data);
    } catch (error) {
        console.error(`Error fetching match ${matchId}:`, error.message);

        return res.status(502).json({
            error: 'Unable to fetch match details',
            details: error.message
        });
    }
}
