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
    name: 'Classique',
    description: 'Style par défaut avec fond gris clair',
    preview: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=200&h=120&fit=crop',
    headerStyle: {
      background: 'rgb(249, 250, 251)',
      border: '1px solid rgb(229, 231, 235)',
      textColor: 'rgb(75, 85, 99)',
      iconColor: 'rgb(107, 114, 128)'
    }
  },
  {
    id: 'glass',
    name: 'Verre',
    description: 'Effet de verre avec transparence et flou',
    preview: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=200&h=120&fit=crop',
    headerStyle: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px) saturate(180%)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
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
    name: 'Coucher de Soleil',
    description: 'Dégradé orange et rose chaleureux',
    preview: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=120&fit=crop',
    headerStyle: {
      background: 'linear-gradient(135deg, rgb(251, 146, 60), rgb(249, 115, 22), rgb(239, 68, 68))',
      border: 'none',
      textColor: 'rgb(255, 255, 255)',
      iconColor: 'rgb(255, 255, 255)'
    }
  },
  {
    id: 'gradient-ocean',
    name: 'Océan',
    description: 'Dégradé bleu profond et turquoise',
    preview: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=200&h=120&fit=crop',
    headerStyle: {
      background: 'linear-gradient(135deg, rgb(59, 130, 246), rgb(14, 165, 233), rgb(6, 182, 212))',
      border: 'none',
      textColor: 'rgb(255, 255, 255)',
      iconColor: 'rgb(255, 255, 255)'
    }
  },
  {
    id: 'gradient-forest',
    name: 'Forêt',
    description: 'Dégradé vert nature et émeraude',
    preview: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200&h=120&fit=crop',
    headerStyle: {
      background: 'linear-gradient(135deg, rgb(34, 197, 94), rgb(16, 185, 129), rgb(5, 150, 105))',
      border: 'none',
      textColor: 'rgb(255, 255, 255)',
      iconColor: 'rgb(255, 255, 255)'
    }
  },
  {
    id: 'gradient-purple',
    name: 'Mystique',
    description: 'Dégradé violet et magenta',
    preview: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=200&h=120&fit=crop',
    headerStyle: {
      background: 'linear-gradient(135deg, rgb(168, 85, 247), rgb(147, 51, 234), rgb(126, 34, 206))',
      border: 'none',
      textColor: 'rgb(255, 255, 255)',
      iconColor: 'rgb(255, 255, 255)'
    }
  },
  {
    id: 'neon-cyber',
    name: 'Cyberpunk',
    description: 'Style néon futuriste avec effets lumineux',
    preview: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=200&h=120&fit=crop',
    headerStyle: {
      background: 'linear-gradient(135deg, rgb(0, 0, 0), rgb(20, 20, 30))',
      border: '1px solid rgb(0, 255, 255)',
      textColor: 'rgb(0, 255, 255)',
      iconColor: 'rgb(0, 255, 255)',
      backdropFilter: 'brightness(1.2)'
    },
    bodyStyle: {
      background: 'rgba(0, 0, 0, 0.8)',
      border: '1px solid rgba(0, 255, 255, 0.3)'
    }
  },
  {
    id: 'minimal-dark',
    name: 'Sombre Minimal',
    description: 'Design épuré avec fond sombre',
    preview: 'https://images.unsplash.com/photo-1557683311-eac922347aa1?w=200&h=120&fit=crop',
    headerStyle: {
      background: 'rgb(31, 41, 55)',
      border: '1px solid rgb(55, 65, 81)',
      textColor: 'rgb(243, 244, 246)',
      iconColor: 'rgb(156, 163, 175)'
    },
    bodyStyle: {
      background: 'rgb(17, 24, 39)'
    }
  },
  {
    id: 'pattern-geometric',
    name: 'Géométrique',
    description: 'Motifs géométriques modernes',
    preview: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=200&h=120&fit=crop',
    headerStyle: {
      backgroundImage: `
        linear-gradient(45deg, rgba(59, 130, 246, 0.1) 25%, transparent 25%),
        linear-gradient(-45deg, rgba(59, 130, 246, 0.1) 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, rgba(59, 130, 246, 0.1) 75%),
        linear-gradient(-45deg, transparent 75%, rgba(59, 130, 246, 0.1) 75%)
      `,
      background: 'rgb(249, 250, 251)',
      border: '1px solid rgb(59, 130, 246)',
      textColor: 'rgb(59, 130, 246)',
      iconColor: 'rgb(59, 130, 246)'
    }
  },
  {
    id: 'holographic',
    name: 'Holographique',
    description: 'Effet holographique irisé',
    preview: 'https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=200&h=120&fit=crop',
    headerStyle: {
      background: `
        linear-gradient(45deg, 
          hsl(240, 100%, 70%) 0%,
          hsl(300, 100%, 70%) 25%,
          hsl(0, 100%, 70%) 50%,
          hsl(60, 100%, 70%) 75%,
          hsl(120, 100%, 70%) 100%
        )
      `,
      border: 'none',
      textColor: 'rgb(255, 255, 255)',
      iconColor: 'rgb(255, 255, 255)',
      backdropFilter: 'brightness(1.1)'
    }
  },
  {
    id: 'winter-snow',
    name: 'Hiver Enneigé',
    description: 'Paysage hivernal avec neige et cristaux de glace',
    preview: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=200&h=120&fit=crop',
    headerStyle: {
      backgroundImage: 'url("https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=200&fit=crop")',
      background: 'linear-gradient(135deg, rgba(219, 234, 254, 0.9), rgba(147, 197, 253, 0.9))',
      border: '1px solid rgba(147, 197, 253, 0.5)',
      textColor: 'rgb(30, 58, 138)',
      iconColor: 'rgb(30, 58, 138)',
      backdropFilter: 'blur(2px) brightness(1.1)'
    },
    bodyStyle: {
      background: 'linear-gradient(180deg, rgba(248, 250, 252, 0.95), rgba(241, 245, 249, 0.95))',
      border: '1px solid rgba(147, 197, 253, 0.3)'
    }
  },
  {
    id: 'autumn-leaves',
    name: 'Automne Doré',
    description: 'Feuilles d\'automne aux couleurs chaudes et dorées',
    preview: 'https://images.unsplash.com/photo-1507371341162-763b5e419618?w=200&h=120&fit=crop',
    headerStyle: {
      backgroundImage: 'url("https://images.unsplash.com/photo-1507371341162-763b5e419618?w=800&h=200&fit=crop")',
      background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.9), rgba(245, 158, 11, 0.9))',
      border: '1px solid rgba(245, 158, 11, 0.5)',
      textColor: 'rgb(120, 53, 15)',
      iconColor: 'rgb(120, 53, 15)',
      backdropFilter: 'blur(2px) brightness(1.1)'
    },
    bodyStyle: {
      background: 'linear-gradient(180deg, rgba(254, 252, 232, 0.95), rgba(253, 246, 178, 0.95))',
      border: '1px solid rgba(245, 158, 11, 0.3)'
    }
  },
  {
    id: 'terminal',
    name: 'Terminal',
    description: 'Style terminal avec fond noir et bordures blanches fines',
    preview: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=200&h=120&fit=crop',
    headerStyle: {
      background: 'rgb(0, 0, 0)',
      border: 'none',
      textColor: 'rgb(255, 255, 255)',
      iconColor: 'rgb(255, 255, 255)'
    },
    bodyStyle: {
      background: 'rgb(0, 0, 0)',
      border: '1px solid rgba(255, 255, 255, 0.3)'
    }
  }
];