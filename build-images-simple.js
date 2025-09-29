#!/usr/bin/env node
/**
 * Simple Image Build Script for Our Projects Section
 * Generates manifest without optimization for speed and compatibility
 */

const fs = require('fs').promises;
const path = require('path');

const ASSETS_DIR = './assets';
const MANIFEST_PATH = path.join(ASSETS_DIR, 'projects-manifest.json');

// Project folders to process (directly under assets/)
const PROJECT_FOLDERS = ['Archan', 'Banaswadi', 'Harsha', 'HP Cafeteria', 'Laggare', 'Manoj', 'MPL', 'Ramu House', 'Reshma'];

// SEO-optimized project descriptions
const PROJECT_DESCRIPTIONS = {
  'Archan': {
    title: 'Archan Luxury Residence',
    description: 'Premium residential interior design featuring contemporary aesthetics with traditional Indian elements. Custom furniture and elegant color schemes create sophisticated living spaces.',
    category: 'Luxury Residential'
  },
  'Banaswadi': {
    title: 'Banaswadi Modern Apartment',
    description: 'Stylish apartment interior design with space optimization and modern functionality. Smart storage solutions and vibrant decor enhance urban living comfort.',
    category: 'Modern Apartment'
  },
  'Harsha': {
    title: 'Harsha Family Home',
    description: 'Warm family home interior design blending comfort with style. Child-friendly spaces and cozy living areas perfect for modern family lifestyle.',
    category: 'Family Home'
  },
  'HP Cafeteria': {
    title: 'HP Corporate Cafeteria',
    description: 'Professional cafeteria design for HP with modern industrial aesthetics. Efficient layout and contemporary furnishing create an inviting dining environment.',
    category: 'Commercial Design'
  },
  'Laggare': {
    title: 'Laggare Contemporary Villa',
    description: 'Luxurious villa interior design with open-concept living and premium finishes. Seamless indoor-outdoor flow and sophisticated material palette.',
    category: 'Contemporary Villa'
  },
  'Manoj': {
    title: 'Manoj Executive Residence',
    description: 'Executive home interior design featuring rich textures and bold design elements. Professional yet comfortable spaces ideal for entertaining.',
    category: 'Executive Residence'
  },
  'MPL': {
    title: 'MPL Commercial Project',
    description: 'Commercial interior design project showcasing professional workspace solutions. Modern office aesthetics with productivity-focused design elements.',
    category: 'Commercial Design'
  },
  'Ramu House': {
    title: 'Ramu Modern Residence',
    description: 'Contemporary residential interior design featuring clean lines and functional elegance. Modern living spaces with thoughtful design elements and premium finishes.',
    category: 'Modern Residence'
  },
  'Reshma': {
    title: 'Reshma Boutique Home',
    description: 'Boutique residential design with personalized touches and artistic flair. Unique color combinations and custom design elements reflect individual style.',
    category: 'Boutique Residential'
  },
  'Sites': {
    title: 'Construction Sites Portfolio',
    description: 'Construction and renovation project documentation showcasing our design process from concept to completion. Behind-the-scenes of our design implementation.',
    category: 'Construction Portfolio'
  }
};

async function getImageDimensions(imagePath) {
  // Return default dimensions since we're not optimizing
  return { width: 1920, height: 1080 };
}

async function processProject(projectName) {
  const projectPath = path.join(ASSETS_DIR, projectName);
  
  try {
    const files = await fs.readdir(projectPath);
    const imageFiles = files.filter(file => 
      /\.(jpe?g|png|webp|avif)$/i.test(file)
    );

    if (imageFiles.length === 0) {
      const unsupportedFormats = [...new Set(files.map(file => path.extname(file).toLowerCase()))];
      console.log(`⚠️  No supported images found in ${projectName} (found ${files.length} files)`);
      if (unsupportedFormats.length > 0) {
        console.log(`   📁 Unsupported formats found: ${unsupportedFormats.join(', ')}`);
        console.log(`   💡 Please convert these files to JPG, PNG, or WebP format`);
        if (unsupportedFormats.includes('.heic')) {
          console.log(`   🍎 HEIC files need to be converted - try using an online converter or photo editing software`);
        }
      }
      return null;
    }

    const images = [];
    
    for (let i = 0; i < imageFiles.length; i++) {
      const imageFile = imageFiles[i];
      const imagePath = path.join(projectPath, imageFile);
      const { width, height } = await getImageDimensions(imagePath);
      
      const imageData = {
        original: {
          src: path.join(projectName, imageFile).replace(/\\/g, '/'),
          width,
          height,
          alt: `${PROJECT_DESCRIPTIONS[projectName]?.title || projectName} - ${imageFile.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ")}`
        },
        variants: [], // No optimization variants for speed
        isLCP: projectName === PROJECT_FOLDERS[0] && i === 0 // First image of first project is LCP candidate
      };

      images.push(imageData);
      console.log(`✅ Added image: ${imageFile}`);
    }

    const projectData = {
      id: projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      title: PROJECT_DESCRIPTIONS[projectName]?.title || projectName,
      folderName: projectName,
      images,
      description: PROJECT_DESCRIPTIONS[projectName]?.description || `${projectName} project showcasing our interior design expertise`,
      category: PROJECT_DESCRIPTIONS[projectName]?.category || 'Interior Design',
      totalImages: images.length
    };

    console.log(`📁 Processed ${projectName}: ${images.length} images`);
    return projectData;

  } catch (error) {
    console.error(`❌ Error processing ${projectName}:`, error.message);
    return null;
  }
}

async function generateManifest() {
  console.log('🚀 Building projects manifest...\n');
  
  const projects = [];
  let totalImages = 0;
  
  for (const projectFolder of PROJECT_FOLDERS) {
    const projectData = await processProject(projectFolder);
    if (projectData) {
      projects.push(projectData);
      totalImages += projectData.images.length;
    }
  }
  
  const manifest = {
    version: Date.now(),
    projects,
    meta: {
      totalProjects: projects.length,
      totalImages,
      buildDate: new Date().toISOString(),
      optimized: false
    }
  };
  
  await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  
  console.log('\n✅ Manifest generated successfully!');
  console.log(`📁 Projects: ${projects.length}`);
  console.log(`🖼️  Images: ${totalImages}`);
  console.log(`📄 Manifest: ${MANIFEST_PATH}`);
  console.log('\n🎉 Build complete! Run your local server to see the projects section.');
  
  return manifest;
}

if (require.main === module) {
  generateManifest().catch(console.error);
}

module.exports = { generateManifest };