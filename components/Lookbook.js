'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './Lookbook.module.css';

const dresses = [
  {
    id: 1,
    name: 'The Rabhta Elegance',
    image: '/lookbook_dress.png',
    thumb: '/lookbook_dress.png', // If you have isolated dresses, put them here
    category: 'Gowns & Dresses',
    link: '/products?category=Dresses'
  },
  {
    id: 2,
    name: 'Modern Power Play',
    image: '/lookbook_casual.png',
    thumb: '/lookbook_casual.png',
    category: 'Tops & Blouses',
    link: '/products?category=Tops+%26+Blouses'
  },
  {
    id: 3,
    name: 'Effortless Co-ords',
    image: '/lookbook_coord.png',
    thumb: '/lookbook_coord.png',
    category: 'Sets',
    link: '/products?category=Co-ord+Sets'
  },
  {
    id: 4,
    name: 'Summer Flow',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600',
    thumb: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600',
    category: 'Dresses',
    link: '/products?category=Dresses'
  },
  {
    id: 5,
    name: 'Professional Chic',
    image: 'https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=600',
    thumb: 'https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=600',
    category: 'Outerwear',
    link: '/products?category=Outerwear+%26+Jackets'
  },
  {
    id: 6,
    name: 'Silky Serenade',
    image: 'https://images.unsplash.com/photo-1554568218-0f1715e72254?w=600',
    thumb: 'https://images.unsplash.com/photo-1554568218-0f1715e72254?w=600',
    category: 'Co-ords',
    link: '/products?category=Co-ord+Sets'
  }
];

export default function Lookbook() {
  const [activeDress, setActiveDress] = useState(0);

  const handleDressClick = (index) => {
    setActiveDress(index);
  };

  return (
    <section className={styles.lookbookSection}>
      <div className={styles.container}>
        
        {/* Left Side: Model Display */}
        <div className={styles.modelArea}>
          <div className={styles.modelStage}>
             {/* Background glow for the model */}
             <div className={styles.modelGlow} />
             
             {/* Base Model (If you have a silhouette image, use it here) */}
             <img src="/base_model.png" alt="Base Model" className={styles.baseModel} onError={(e) => e.target.style.opacity = '0'} />
             
             {/* Overlaid Look Images */}
             {dresses.map((dress, i) => (
               <img 
                 key={dress.id}
                 src={dress.image}
                 alt={dress.name}
                 className={`${styles.overlayImage} ${i === activeDress ? styles.activeOverlay : ''}`}
               />
             ))}
          </div>

          <div className={styles.activeInfo}>
             <span className={styles.categoryEyebrow}>{dresses[activeDress].category}</span>
             <h3 className={styles.dressTitle}>{dresses[activeDress].name}</h3>
             <Link href={dresses[activeDress].link} className={`btn btn-gold ${styles.shopBtn}`}>
               Shop The Look
             </Link>
          </div>
        </div>

        {/* Right Side: Wheel of Dresses */}
        <div className={styles.wheelArea}>
          <div className={styles.wheelContainer}>
             <div className={styles.wheelCenter}>
               <h2>Try On Base</h2>
               <p>Tap a piece</p>
             </div>
             
             {/* The rotating wheel track */}
             <div className={styles.wheelTrack}>
               {dresses.map((dress, i) => {
                 // Calculate angle for a circle. E.g. for 6 items: 0, 60, 120, 180, 240, 300
                 const angle = (360 / dresses.length) * i;
                 const isActive = i === activeDress;
                 
                 return (
                   <div 
                     key={dress.id} 
                     className={`${styles.wheelItemWrap} ${isActive ? styles.wheelItemActive : ''}`}
                     style={{
                       // Translate out to form the circle's radius (e.g. 18vw outwards)
                       transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-18vw) rotate(-${angle}deg)`
                     }}
                   >
                     <div 
                       className={styles.wheelItem} 
                       onClick={() => handleDressClick(i)}
                     >
                       <img src={dress.thumb} alt={dress.name} className={styles.thumbImage} />
                       
                       {/* SVG connecting line effect to center */}
                       {isActive && (
                         <div className={styles.activeConnection} />
                       )}
                     </div>
                   </div>
                 )
               })}
             </div>
          </div>
        </div>

      </div>
    </section>
  );
}
