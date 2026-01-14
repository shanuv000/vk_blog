const fs = require('fs');
const path = require('path');
const https = require('https');

// [Keep your existing STRATEGY object exactly as is]
const STRATEGY = {
    'react2shell-cve-2025-55182-rce-analysis': [
        {
            anchor: 'MongoBleed memory leak',
            url: '/post/mongobleed-cve-2025-14847-mongodb-memory-leak-exposed-databases',
            sentence: "This vulnerability arrives in the wake of other major 2025 security incidents, such as the [MongoBleed memory leak] that exposed thousands of databases.",
            placement: 'Introduction'
        },
        {
            anchor: 'React and Next.js guide',
            url: '/post/getting-started-react-nextjs',
            sentence: "Developers following our [React and Next.js guide] should immediately audit their dependencies to prevent this exploit.",
            placement: 'Mitigation'
        }
    ],
    'epstein-files-explained-documents-transparency': [
        {
            anchor: 'Bondi Beach terror attack',
            url: '/post/bondi-beach-terror-attack-unseen-truths',
            sentence: "Discerning fact from fiction is critical in high-profile cases, similar to the misinformation challenges seen after the [Bondi Beach terror attack].",
            placement: 'Media Coverage'
        }
    ],
    'ai-memory-demand-pc-upgrade-costs': [
        {
            anchor: 'OpenAI and Microsoft IPO talks',
            url: '/post/openai-microsoft-ipo-talks-2025',
            sentence: "The demand for high-performance memory is largely driven by AI infrastructure expansion from giants discussed in our analysis of [OpenAI and Microsoft IPO talks].",
            placement: 'AI Demand'
        },
        {
            anchor: 'US-China trade truce',
            url: '/post/us-china-trade-truce-trump-drug-price-policy-2025',
            sentence: "Global supply chains remain fragile, further complicated by geopolitical shifts such as the [US-China trade truce].",
            placement: 'Supply Chain'
        },
        {
            anchor: '5G spectrum auction approval',
            url: '/post/5g-spectrum-auction-gets-cabinet-greenlight-as-services-to-roll-out-soon',
            sentence: "Similar infrastructure costs are rising in the telecommunications sector following the [5G spectrum auction approval].",
            placement: 'Impact'
        }
    ],
    'bgmi-1-9-holi-update-free-rewards-download-links-storage': [
        {
            anchor: 'Apex Legends Season 12 patch notes',
            url: '/post/apex-legends-season-12-patch-notes',
            sentence: "Players looking for more battle royale content should also check out the massive changes in the [Apex Legends Season 12 patch notes].",
            placement: 'Conclusion'
        },
        {
            anchor: 'BGMI star Mortal',
            url: '/post/how-bgmi-star-mortal-celebrate-7-million-subscribers-youtuber',
            sentence: "The update has been praised by top community figures, including [BGMI star Mortal].",
            placement: 'Community'
        },
        {
            anchor: 'Warzone\'s latest season',
            url: '/post/warzone-hackers-flying-cars-again-cheats-in-caldera-1743521',
            sentence: "Unlike the rampant cheating issues reported in [Warzone's latest season], this BGMI update focuses heavily on stability and rewards.",
            placement: 'Security'
        }
    ],
    'getting-started-react-nextjs': [
        {
            anchor: 'React2Shell RCE',
            url: '/post/react2shell-cve-2025-55182-rce-analysis',
            sentence: "When setting up your environment, be aware of security best practices to avoid vulnerabilities like the [React2Shell RCE].",
            placement: 'Setup'
        },
        {
            anchor: 'MongoBleed CVE-2025-14847',
            url: '/post/mongobleed-cve-2025-14847-mongodb-memory-leak-exposed-databases',
            sentence: "For your backend database, ensure you secure your MongoDB instances to prevent leaks similar to [MongoBleed CVE-2025-14847].",
            placement: 'Database'
        }
    ],
    'mongobleed-cve-2025-14847-mongodb-memory-leak-exposed-databases': [
        {
            anchor: 'React2Shell vulnerability',
            url: '/post/react2shell-cve-2025-55182-rce-analysis',
            sentence: "This is the second major database-related concern this year, following closely on the heels of the [React2Shell vulnerability].",
            placement: 'Introduction'
        },
        {
            anchor: 'React + Next.js guide',
            url: '/post/getting-started-react-nextjs',
            sentence: "Developers using MERN stack (MongoDB, Express, React, Node) should consult our [React + Next.js guide] for secure configuration patterns.",
            placement: 'Mitigation'
        }
    ],
    'from-max-to-hbo-max': [
        {
            anchor: 'Thor 4 trailer prediction',
            url: '/post/thor-4-love-and-thunder-trailer-release-date-prediction',
            sentence: "The platform continues to host major blockbusters, including upcoming Marvel hits discussed in our [Thor 4 trailer prediction].",
            placement: 'Library'
        },
        {
            anchor: 'Disney+ removed Netflix branding',
            url: '/post/disney-marvel-netflix-watch-shows-name',
            sentence: "Rebranding is common in the streaming wars, similar to how [Disney+ removed Netflix branding] from its Marvel library.",
            placement: 'Analysis'
        }
    ],
    'apex-legends-players-disappointed-by-one-odd-feature-about-new-legends-design': [
        {
            anchor: 'Apex Legends Season 12 patch notes',
            url: '/post/apex-legends-season-12-patch-notes',
            sentence: "This design controversy arrives alongside the major gameplay changes detailed in the [Apex Legends Season 12 patch notes].",
            placement: 'Context'
        },
        {
            anchor: 'players demanded more support characters',
            url: '/post/apex-legends-players-call-on-respawn-to-add-more-support-legends-after-maggie-reveal',
            sentence: "This isn't the first time the community has been vocal; previously, [players demanded more support characters] to balance the meta.",
            placement: 'Community'
        },
        {
            anchor: 'new Prestige skins',
            url: '/post/apex-legends-prestige-skins-finishers',
            sentence: "Ideally, future updates will address these concerns along with the release of [new Prestige skins] and cosmetics.",
            placement: 'Future'
        }
    ],
    'record-26632-crore-sip-inflows-april-2025': [
        {
            anchor: 'OpenAI and Microsoft IPOs',
            url: '/post/openai-microsoft-ipo-talks-2025',
            sentence: "Investor confidence is also being shaped by global tech movements, such as the anticipation surrounding [OpenAI and Microsoft IPOs].",
            placement: 'Sentiment'
        },
        {
            anchor: 'US-China trade truce',
            url: '/post/us-china-trade-truce-trump-drug-price-policy-2025',
            sentence: "Stability in international markets, potentially aided by the [US-China trade truce], encourages domestic investment growth.",
            placement: 'Global'
        }
    ]
};

function getEnvVars() {
    try {
        const envLocal = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8');
        const parseEnv = (content) => {
            const vars = {};
            content.split('\n').forEach(line => {
                const match = line.match(/^([^=]+)=(.*)$/);
                if (match) vars[match[1].trim()] = match[2].trim().replace(/^"|"$/g, '');
            });
            return vars;
        };
        return parseEnv(envLocal);
    } catch (e) { return {}; }
}

const envVars = getEnvVars();
const ENDPOINT = envVars.NEXT_PUBLIC_HYGRAPH_CONTENT_API;
const TOKEN = envVars.HYGRAPH_AUTH_TOKEN;

function fetchGraphQL(query, variables = {}) {
    return new Promise((resolve, reject) => {
        const dataString = JSON.stringify({ query, variables });
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
        req.write(dataBuffer);
        req.end();
    });
}

// ✅ FIXED: Use 'href' (matches your existing links)
function createParagraph(sentence, anchor, url) {
    const parts = sentence.split(`[${anchor}]`);
    const children = [];

    if (parts[0]) children.push({ text: parts[0] });

    children.push({
        type: 'link',
        href: url.startsWith('http') ? url : `https://blog.urtechy.com${url}`,  // ✅ href not url
        children: [{ text: anchor }]
    });

    if (parts[1]) children.push({ text: parts[1] });

    return { type: 'paragraph', children };
}

async function main() {
    console.log("Starting Link Implementation...\n");

    const results = [];

    for (const [slug, links] of Object.entries(STRATEGY)) {
        console.log(`Processing: ${slug}`);

        // 1. Fetch
        const query = `query GetPost($slug: String!) { post(where: { slug: $slug }) { id title content { json } } }`;
        const res = await fetchGraphQL(query, { slug });
        const post = res.data?.post;

        if (!post) {
            console.error("  ❌ Not Found");
            results.push({ title: slug, status: 'Failed (Not Found)' });
            continue;
        }

        let contentAST = JSON.parse(JSON.stringify(post.content.json)); // Deep clone
        let modified = false;
        let addedLinks = [];

        // 2. Modify
        for (const link of links) {
            if (JSON.stringify(contentAST).includes(link.anchor)) {
                console.log(`  ⏭️  Exists: ${link.anchor}`);
                addedLinks.push(`${link.anchor} (Exists)`);
                continue;
            }

            const newPara = createParagraph(link.sentence, link.anchor, link.url);

            // Find insertion index
            let index = 1;
            const lowerPlacement = link.placement.toLowerCase();

            if (['intro', 'introduction'].some(k => lowerPlacement.includes(k))) {
                index = 2;
            } else if (['conclusion', 'end'].some(k => lowerPlacement.includes(k))) {
                index = contentAST.children.length - 1;
            } else {
                // Search headings
                for (let i = 0; i < contentAST.children.length; i++) {
                    const node = contentAST.children[i];
                    if (node.type && node.type.startsWith('heading')) {
                        const headingText = JSON.stringify(node).toLowerCase();
                        if (headingText.includes(lowerPlacement)) {
                            index = i + 1;
                            break;
                        }
                    }
                }
            }

            if (index >= contentAST.children.length) index = contentAST.children.length;

            contentAST.children.splice(index, 0, newPara);
            modified = true;
            addedLinks.push(link.anchor);
            console.log(`  ➕ Inserting: ${link.anchor} at position ${index}`);
        }

        if (modified) {
            // 3. Update with simplified mutation
            const mutation = `
                mutation UpdatePost($id: ID!, $content: RichTextAST!) {
                    updatePost(
                        where: { id: $id }
                        data: { content: $content }
                    ) {
                        id
                    }
                }
            `;

            const updateRes = await fetchGraphQL(mutation, {
                id: post.id,
                content: contentAST  // Pass AST directly
            });

            if (updateRes.errors) {
                console.error("  ❌ Mutation Error:", updateRes.errors[0].message);
                results.push({
                    title: post.title,
                    status: 'Failed',
                    error: updateRes.errors[0].message
                });
            } else {
                // 4. Publish
                const publishMutation = `
                    mutation PublishPost($id: ID!) {
                        publishPost(where: { id: $id }, to: PUBLISHED) {
                            id
                        }
                    }
                `;
                await fetchGraphQL(publishMutation, { id: post.id });

                console.log("  ✅ Success: Updated & Published");
                results.push({
                    title: post.title,
                    status: 'Success',
                    links: addedLinks.join(', ')
                });
            }
        } else {
            console.log("  ℹ️  No changes needed");
            results.push({
                title: post.title,
                status: 'No Changes',
                links: addedLinks.join(', ')
            });
        }
    }

    // Summary
    console.log("\n\n" + "=".repeat(80));
    console.log("SUMMARY TABLE");
    console.log("=".repeat(80));
    console.log("| Post Title | Status | Links |");
    console.log("|" + "-".repeat(35) + "|" + "-".repeat(20) + "|" + "-".repeat(20) + "|");

    results.forEach(r => {
        const title = r.title.slice(0, 33).padEnd(33);
        const status = r.status.padEnd(18);
        const info = (r.links || r.error || '').slice(0, 18);
        console.log(`| ${title} | ${status} | ${info} |`);
    });

    const successCount = results.filter(r => r.status === 'Success').length;
    console.log("=".repeat(80));
    console.log(`✅ Successful: ${successCount}/${results.length}`);
}

main().catch(err => {
    console.error('\n❌ Fatal Error:', err.message);
    process.exit(1);
});
