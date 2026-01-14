const https = require('https');
const fs = require('fs');
const path = require('path');

function getEnvVars() {
    const envLocal = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8');
    const vars = {};
    envLocal.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) vars[match[1].trim()] = match[2].trim().replace(/^"|"$/g, '');
    });
    return vars;
}

const envVars = getEnvVars();
const ENDPOINT = envVars.NEXT_PUBLIC_HYGRAPH_CONTENT_API;
const TOKEN = envVars.HYGRAPH_AUTH_TOKEN;

function fetchGraphQL(query) {
    return new Promise((resolve, reject) => {
        const dataString = JSON.stringify({ query });
        const dataBuffer = Buffer.from(dataString);
        const url = new URL(ENDPOINT);
        const req = https.request({
            hostname: url.hostname,
            path: url.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': dataBuffer.length,
                'Authorization': `Bearer ${TOKEN}`
            }
        }, (res) => {
            let body = '';
            res.on('data', c => body += c);
            res.on('end', () => resolve(JSON.parse(body)));
        });
        req.on('error', reject);
        req.write(dataBuffer);
        req.end();
    });
}

async function main() {
    console.log('=== TAG AUDIT ===\n');

    // Get all tags with post counts
    const tagQuery = `
        query {
            tags {
                id
                name
                slug
                posts {
                    id
                }
            }
        }
    `;

    const tagData = await fetchGraphQL(tagQuery);
    const tags = tagData.data.tags;

    const tagStats = tags
        .map(tag => ({
            name: tag.name,
            slug: tag.slug,
            count: tag.posts.length,
            id: tag.id
        }))
        .sort((a, b) => b.count - a.count);

    console.log(`Total tags: ${tags.length}\n`);

    // High usage tags
    console.log('📊 HIGH USAGE TAGS (10+ posts):\n');
    const highUsage = tagStats.filter(t => t.count >= 10);
    highUsage.forEach(tag => {
        const bar = '█'.repeat(Math.ceil(tag.count / 5));
        console.log(`  ${tag.name.padEnd(35)} ${String(tag.count).padStart(3)} ${bar}`);
    });

    // Medium usage
    console.log('\n📈 MEDIUM USAGE TAGS (3-9 posts):\n');
    const mediumUsage = tagStats.filter(t => t.count >= 3 && t.count < 10);
    mediumUsage.forEach(tag => {
        console.log(`  ${tag.name.padEnd(35)} ${String(tag.count).padStart(3)}`);
    });

    // Low usage (candidates for deletion)
    console.log('\n⚠️  LOW USAGE TAGS (1-2 posts - consider removing):\n');
    const lowUsage = tagStats.filter(t => t.count >= 1 && t.count < 3);
    lowUsage.slice(0, 20).forEach(tag => {
        console.log(`  ${tag.name.padEnd(35)} ${String(tag.count).padStart(3)}`);
    });
    if (lowUsage.length > 20) {
        console.log(`  ... and ${lowUsage.length - 20} more`);
    }

    // Unused tags
    const unused = tagStats.filter(t => t.count === 0);
    if (unused.length > 0) {
        console.log(`\n🗑️  UNUSED TAGS (${unused.length} - delete immediately):\n`);
        unused.slice(0, 10).forEach(tag => {
            console.log(`  - ${tag.name}`);
        });
        if (unused.length > 10) {
            console.log(`  ... and ${unused.length - 10} more`);
        }
    }

    // Check for overlaps/duplicates
    console.log('\n🔍 POTENTIAL DUPLICATES/OVERLAPS:\n');

    const potentialDupes = [
        { tags: ['Cricket & IPL', 'Sports News', 'Sports Esports'], suggestion: 'Merge to specific sports tags' },
        { tags: ['AI & Artificial Intelligence', 'Tutorial & Guide'], suggestion: 'Keep separate but audit usage' },
        { tags: ['MCU & Marvel', 'DC Comics Universe'], suggestion: 'Keep separate (distinct franchises)' },
        { tags: ['Esports & Competitive Gaming', 'Sports Esports'], suggestion: 'Merge to "Esports"' },
        { tags: ['TV Shows & Series', 'Streaming Services'], suggestion: 'Related but keep separate' }
    ];

    potentialDupes.forEach(group => {
        const existing = group.tags.filter(t => tagStats.find(ts => ts.name === t));
        if (existing.length > 1) {
            console.log(`  • ${existing.join(' + ')}`);
            console.log(`    → ${group.suggestion}\n`);
        }
    });

    // Tag distribution stats
    console.log('\n📊 SUMMARY STATISTICS:\n');
    console.log(`  Total tags:              ${tags.length}`);
    console.log(`  High usage (10+):        ${highUsage.length}`);
    console.log(`  Medium usage (3-9):      ${mediumUsage.length}`);
    console.log(`  Low usage (1-2):         ${lowUsage.length}`);
    console.log(`  Unused (0):              ${unused.length}`);
    console.log(`\n  Recommended: Keep ${highUsage.length + mediumUsage.length}, Delete ${lowUsage.length + unused.length}`);
}

main().catch(err => console.error('Error:', err.message));
