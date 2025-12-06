#!/usr/bin/env node
const { GraphQLClient } = require('graphql-request');
require('dotenv').config({ path: '../.env.local' });

const client = new GraphQLClient(process.env.NEXT_PUBLIC_HYGRAPH_CDN_API);

const query = `
  query GetAllCategoriesWithPostCount {
    categories(orderBy: name_ASC) {
      id
      name
      slug
      show
      posts {
        id
      }
    }
  }
`;

client.request(query).then(data => {
  console.log('\n📊 CATEGORY ANALYSIS\n');
  console.log('Total Categories:', data.categories.length);
  console.log('');
  
  const visible = data.categories.filter(c => c.show);
  const hidden = data.categories.filter(c => !c.show);
  
  console.log('Visible Categories:', visible.length);
  console.log('Hidden Categories:', hidden.length);
  console.log('');
  
  console.log('📋 ALL CATEGORIES (sorted by post count):');
  console.log('─'.repeat(60));
  
  const sorted = [...data.categories].sort((a, b) => b.posts.length - a.posts.length);
  
  sorted.forEach(cat => {
    const status = cat.show ? '✅' : '❌';
    const postCount = cat.posts.length;
    console.log(`${status} ${cat.name.padEnd(25)} | ${postCount.toString().padStart(3)} posts | slug: ${cat.slug}`);
  });
  
  console.log('');
  console.log('⚠️  EMPTY CATEGORIES (0 posts):');
  const empty = data.categories.filter(c => c.posts.length === 0);
  if (empty.length === 0) {
    console.log('   None found');
  } else {
    empty.forEach(c => console.log(`   - ${c.name} (${c.show ? 'visible' : 'hidden'})`));
  }
  
  console.log('');
  console.log('⚠️  LOW-POST CATEGORIES (1-2 posts):');
  const lowPost = data.categories.filter(c => c.posts.length > 0 && c.posts.length <= 2);
  if (lowPost.length === 0) {
    console.log('   None found');
  } else {
    lowPost.forEach(c => console.log(`   - ${c.name}: ${c.posts.length} posts (${c.show ? 'visible' : 'hidden'})`));
  }
  
}).catch(err => console.error('Error:', err.message));
