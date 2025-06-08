export interface CardTheme {
  id: string;
  name: string;
  description: string;
  preview: string;
  headerStyle: {
    background?: string;
    backgroundImage?: string;
    backdropFilter?: string;
    border?: string;
    borderRadius?: string;
    opacity?: number;
    textColor?: string;
    iconColor?: string;
  };
  bodyStyle?: {
    background?: string;
    backdropFilter?: string;
    border?: string;
  };
}

export const cardThemes: CardTheme[] = [
  {
    id: 'default',
    name: 'Classique Transparent',
    description: 'Style par défaut avec effet de transparence comme le menu horizontal',
    preview: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=200&h=120&fit=crop',
    headerStyle: {
      background: 'rgba(249, 250, 251, 0.4)',
      backdropFilter: 'blur(10px) saturate(180%)',
      textColor: 'rgb(75, 85, 99)',
      iconColor: 'rgb(107, 114, 128)'
    }
  },
  {
    id: 'glass',
    name: 'Verre Ultra',
    description: 'Effet de verre renforcé avec transparence maximale',
    preview: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=200&h=120&fit=crop',
    headerStyle: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(15px) saturate(200%)',
      textColor: 'rgb(255, 255, 255)',
      iconColor: 'rgb(255, 255, 255)'
    },
    bodyStyle: {
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(5px)'
    }
  },
  {
    id: 'gradient-sunset',
    name: 'Coucher de Soleil Transparent',
    description: 'Dégradé orange et rose avec transparence',
    preview: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=120&fit=crop',
    headerStyle: {
      background: 'rgba(251, 146, 60, 0.4)',
      backdropFilter: 'blur(10px) saturate(180%)',
      textColor: 'rgb(255, 255, 255)',
      iconColor: 'rgb(255, 255, 255)'
    }
  },
  {
    id: 'gradient-ocean',
    name: 'Océan Transparent',
    description: 'Dégradé bleu avec effet de transparence',
    preview: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=200&h=120&fit=crop',
    headerStyle: {
      background: 'rgba(59, 130, 246, 0.4)',
      backdropFilter: 'blur(10px) saturate(180%)',
      textColor: 'rgb(255, 255, 255)',
      iconColor: 'rgb(255, 255, 255)'
    }
  },
  {
    id: 'gradient-forest',
    name: 'Forêt Transparente',
    description: 'Dégradé vert avec effet de transparence',
    preview: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200&h=120&fit=crop',
    headerStyle: {
      background: 'rgba(34, 197, 94, 0.4)',
      backdropFilter: 'blur(10px) saturate(180%)',
      textColor: 'rgb(255, 255, 255)',
      iconColor: 'rgb(255, 255, 255)'
    }
  },
  {
    id: 'gradient-purple',
    name: 'Mystique Transparent',
    description: 'Dégradé violet avec effet de transparence',
    preview: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=200&h=120&fit=crop',
    headerStyle: {
      background: 'rgba(168, 85, 247, 0.4)',
      backdropFilter: 'blur(10px) saturate(180%)',
      textColor: 'rgb(255, 255, 255)',
      iconColor: 'rgb(255, 255, 255)'
    }
  },
  {
    id: 'neon-cyber',
    name: 'Cyberpunk Transparent',
    description: 'Style néon futuriste avec transparence',
    preview: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=200&h=120&fit=crop',
    headerStyle: {
      background: 'rgba(0, 20, 30, 0.4)',
      backdropFilter: 'blur(10px) saturate(180%) brightness(1.2)',
      textColor: 'rgb(0, 255, 255)',
      iconColor: 'rgb(0, 255, 255)'
    },
    bodyStyle: {
      background: 'rgba(0, 0, 0, 0.3)',
      backdropFilter: 'blur(5px)'
    }
  },
  {
    id: 'minimal-dark',
    name: 'Sombre Transparent',
    description: 'Design épuré sombre avec transparence',
    preview: 'https://images.unsplash.com/photo-1557683311-eac922347aa1?w=200&h=120&fit=crop',
    headerStyle: {
      background: 'rgba(31, 41, 55, 0.4)',
      backdropFilter: 'blur(10px) saturate(180%)',
      textColor: 'rgb(243, 244, 246)',
      iconColor: 'rgb(156, 163, 175)'
    },
    bodyStyle: {
      background: 'rgba(17, 24, 39, 0.3)',
      backdropFilter: 'blur(5px)'
    }
  },
  {
    id: 'pattern-geometric',
    name: 'Géométrique Transparent',
    description: 'Motifs géométriques avec transparence',
    preview: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=200&h=120&fit=crop',
    headerStyle: {
      background: 'rgba(249, 250, 251, 0.4)',
      backdropFilter: 'blur(10px) saturate(180%)',
      backgroundImage: `
        linear-gradient(45deg, rgba(59, 130, 246, 0.1) 25%, transparent 25%),
        linear-gradient(-45deg, rgba(59, 130, 246, 0.1) 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, rgba(59, 130, 246, 0.1) 75%),
        linear-gradient(-45deg, transparent 75%, rgba(59, 130, 246, 0.1) 75%)
      `,
      textColor: 'rgb(59, 130, 246)',
      iconColor: 'rgb(59, 130, 246)'
    }
  },
  {
    id: 'holographic',
    name: 'Holographique Transparent',
    description: 'Effet holographique avec transparence',
    preview: 'https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=200&h=120&fit=crop',
    headerStyle: {
      background: 'rgba(255, 255, 255, 0.2)',
      backdropFilter: 'blur(10px) saturate(200%) brightness(1.1)',
      backgroundImage: `
        linear-gradient(45deg, 
          hsla(240, 100%, 70%, 0.3) 0%,
          hsla(300, 100%, 70%, 0.3) 25%,
          hsla(0, 100%, 70%, 0.3) 50%,
          hsla(60, 100%, 70%, 0.3) 75%,
          hsla(120, 100%, 70%, 0.3) 100%
        )
      `,
      textColor: 'rgb(255, 255, 255)',
      iconColor: 'rgb(255, 255, 255)'
    }
  },
  // THÈMES AVEC IMAGES ET TRANSPARENCE (style Mozilla Firefox)
  {
    id: 'halloween-moon-bats',
    name: 'Halloween Moon Bats',
    description: 'Thème Halloween avec transparence et effet de flou',
    preview: 'https://images.unsplash.com/photo-1509557965043-36ce8a2d4b8d?w=200&h=120&fit=crop',
    headerStyle: {
      backgroundImage: 'url("https://images.unsplash.com/photo-1509557965043-36ce8a2d4b8d?w=800&h=200&fit=crop")',
      background: 'rgba(139, 0, 0, 0.4)',
      backdropFilter: 'blur(10px) saturate(180%) brightness(0.9) contrast(1.2)',
      textColor: 'rgb(255, 255, 255)',
      iconColor: 'rgb(255, 255, 255)'
    }
  },
  {
    id: 'dark-mysterious-forest',
    name: 'Dark Mysterious Forest',
    description: 'Forêt mystérieuse avec transparence et effet cyan',
    preview: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=200&h=120&fit=crop',
    headerStyle: {
      backgroundImage: 'url("https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=200&fit=crop")',
      background: 'rgba(0, 20, 40, 0.4)',
      backdropFilter: 'blur(10px) saturate(180%) brightness(0.8) contrast(1.3)',
      textColor: 'rgb(0, 255, 255)',
      iconColor: 'rgb(0, 255, 255)'
    }
  },
  {
    id: 'northern-lights',
    name: 'Northern Lights',
    description: 'Aurores boréales avec transparence et saturation',
    preview: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=200&h=120&fit=crop',
    headerStyle: {
      backgroundImage: 'url("https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&h=200&fit=crop")',
      background: 'rgba(0, 100, 0, 0.4)',
      backdropFilter: 'blur(10px) saturate(200%) brightness(1.1)',
      textColor: 'rgb(144, 238, 144)',
      iconColor: 'rgb(144, 238, 144)'
    }
  },
  {
    id: 'space-nebula',
    name: 'Space Nebula',
    description: 'Nébuleuse spatiale avec transparence et saturation élevée',
    preview: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=200&h=120&fit=crop',
    headerStyle: {
      backgroundImage: 'url("https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=200&fit=crop")',
      background: 'rgba(75, 0, 130, 0.4)',
      backdropFilter: 'blur(10px) saturate(220%) brightness(1.2)',
      textColor: 'rgb(255, 182, 193)',
      iconColor: 'rgb(255, 182, 193)'
    }
  },
  {
    id: 'cherry-blossom',
    name: 'Cherry Blossom',
    description: 'Fleurs de cerisier avec transparence douce',
    preview: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=200&h=120&fit=crop',
    headerStyle: {
      backgroundImage: 'url("https://images.unsplash.com/photo-1522383225653-ed111181a951?w=800&h=200&fit=crop")',
      background: 'rgba(255, 182, 193, 0.4)',
      backdropFilter: 'blur(10px) saturate(180%) brightness(1.1)',
      textColor: 'rgb(139, 69, 19)',
      iconColor: 'rgb(139, 69, 19)'
    }
  },
  {
    id: 'mountain-sunset',
    name: 'Mountain Sunset',
    description: 'Coucher de soleil montagneux avec transparence',
    preview: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=120&fit=crop',
    headerStyle: {
      backgroundImage: 'url("https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=200&fit=crop")',
      background: 'rgba(255, 140, 0, 0.4)',
      backdropFilter: 'blur(10px) saturate(180%) brightness(1.0) contrast(1.2)',
      textColor: 'rgb(255, 255, 255)',
      iconColor: 'rgb(255, 255, 255)'
    }
  },
  {
    id: 'ocean-waves',
    name: 'Ocean Waves',
    description: 'Vagues océaniques avec transparence bleue',
    preview: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=200&h=120&fit=crop',
    headerStyle: {
      backgroundImage: 'url("https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800&h=200&fit=crop")',
      background: 'rgba(0, 191, 255, 0.4)',
      backdropFilter: 'blur(10px) saturate(190%) brightness(1.1)',
      textColor: 'rgb(255, 255, 255)',
      iconColor: 'rgb(255, 255, 255)'
    }
  },
  {
    id: 'cyberpunk-city',
    name: 'Cyberpunk City',
    description: 'Ville futuriste avec transparence néon',
    preview: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=200&h=120&fit=crop',
    headerStyle: {
      backgroundImage: 'url("https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=200&fit=crop")',
      background: 'rgba(255, 0, 255, 0.3)',
      backdropFilter: 'blur(10px) saturate(250%) brightness(1.3) contrast(1.5)',
      textColor: 'rgb(0, 255, 255)',
      iconColor: 'rgb(255, 0, 255)'
    }
  },
  {
    id: 'lavender-field',
    name: 'Lavender Field',
    description: 'Champ de lavande avec transparence violette',
    preview: 'https://images.unsplash.com/photo-1499002238440-d264edd596ec?w=200&h=120&fit=crop',
    headerStyle: {
      backgroundImage: 'url("https://images.unsplash.com/photo-1499002238440-d264edd596ec?w=800&h=200&fit=crop")',
      background: 'rgba(147, 112, 219, 0.4)',
      backdropFilter: 'blur(10px) saturate(180%) brightness(1.0)',
      textColor: 'rgb(255, 255, 255)',
      iconColor: 'rgb(255, 255, 255)'
    }
  },
  {
    id: 'desert-dunes',
    name: 'Desert Dunes',
    description: 'Dunes de sable avec transparence dorée',
    preview: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=200&h=120&fit=crop',
    headerStyle: {
      backgroundImage: 'url("https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&h=200&fit=crop")',
      background: 'rgba(255, 215, 0, 0.4)',
      backdropFilter: 'blur(10px) saturate(180%) brightness(1.1) contrast(1.1)',
      textColor: 'rgb(139, 69, 19)',
      iconColor: 'rgb(139, 69, 19)'
    }
  }
];
