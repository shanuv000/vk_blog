import axios from 'axios';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const response = await axios.get('https://drop.urtechy.com/api/cricket/live-scores', {
            timeout: 10000 // 10s timeout
        });

        // Cache Control
        res.setHeader(
            'Cache-Control',
            'public, s-maxage=10, stale-while-revalidate=20'
        );

        // Wrap in { data: ... } structure to match specific frontend extraction logic
        return res.status(200).json({ data: response.data });
    } catch (error) {
        console.error('Error fetching live scores:', error.message);

        // Fail gracefully
        return res.status(502).json({
            error: 'Unable to fetch live scores',
            details: error.message
        });
    }
}
