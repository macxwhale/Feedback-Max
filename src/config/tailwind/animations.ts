
export const keyframes = {
  'accordion-down': {
    from: {
      height: '0'
    },
    to: {
      height: 'var(--radix-accordion-content-height)'
    }
  },
  'accordion-up': {
    from: {
      height: 'var(--radix-accordion-content-height)'
    },
    to: {
      height: '0'
    }
  },
  'fade-in': {
    '0%': {
      opacity: '0',
      transform: 'translateY(10px)'
    },
    '100%': {
      opacity: '1',
      transform: 'translateY(0)'
    }
  },
  'scale-in': {
    '0%': {
      transform: 'scale(0.95)',
      opacity: '0'
    },
    '100%': {
      transform: 'scale(1)',
      opacity: '1'
    }
  },
  'pulse-success': {
    '0%, 100%': {
      transform: 'scale(1)',
      opacity: '1'
    },
    '50%': {
      transform: 'scale(1.1)',
      opacity: '0.8'
    }
  },
  'pulse-gentle': {
    '0%, 100%': {
      transform: 'scale(1)',
      opacity: '0.8'
    },
    '50%': {
      transform: 'scale(1.05)',
      opacity: '0.6'
    }
  },
  'float': {
    '0%, 100%': {
      transform: 'translateY(0px) rotate(0deg)'
    },
    '33%': {
      transform: 'translateY(-10px) rotate(1deg)'
    },
    '66%': {
      transform: 'translateY(5px) rotate(-1deg)'
    }
  },
  'flow': {
    '0%, 100%': {
      transform: 'translateX(0px) translateY(0px) scale(1)'
    },
    '33%': {
      transform: 'translateX(10px) translateY(-10px) scale(1.1)'
    },
    '66%': {
      transform: 'translateX(-5px) translateY(5px) scale(0.9)'
    }
  },
  'morph': {
    '0%, 100%': {
      borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%'
    },
    '50%': {
      borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%'
    }
  },
  'blob': {
    '0%': {
      transform: 'translate(0px, 0px) scale(1)'
    },
    '33%': {
      transform: 'translate(30px, -50px) scale(1.1)'
    },
    '66%': {
      transform: 'translate(-20px, 20px) scale(0.9)'
    },
    '100%': {
      transform: 'translate(0px, 0px) scale(1)'
    }
  },
  'fluid-move': {
    '0%, 100%': {
      transform: 'translateX(0%) translateY(0%) rotate(0deg) scale(1)'
    },
    '25%': {
      transform: 'translateX(20%) translateY(-10%) rotate(90deg) scale(1.1)'
    },
    '50%': {
      transform: 'translateX(0%) translateY(-20%) rotate(180deg) scale(0.9)'
    },
    '75%': {
      transform: 'translateX(-20%) translateY(-10%) rotate(270deg) scale(1.05)'
    }
  }
};

export const animation = {
  'accordion-down': 'accordion-down 0.2s ease-out',
  'accordion-up': 'accordion-up 0.2s ease-out',
  'fade-in': 'fade-in 0.3s ease-out',
  'scale-in': 'scale-in 0.2s ease-out',
  'pulse-success': 'pulse-success 0.5s ease-in-out',
  'pulse-gentle': 'pulse-gentle 3s ease-in-out infinite',
  'float': 'float 6s ease-in-out infinite',
  'flow': 'flow 8s ease-in-out infinite',
  'morph': 'morph 8s ease-in-out infinite',
  'blob': 'blob 7s ease-in-out infinite',
  'fluid-move': 'fluid-move 12s ease-in-out infinite'
};
