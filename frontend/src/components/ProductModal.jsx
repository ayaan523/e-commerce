import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, useGLTF, Center } from '@react-three/drei';
import '../App.css'; 

const ModalClothingModel = () => {
  const { scene } = useGLTF('/models/hoodie.glb'); 

  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh) {
          child.frustumCulled = false;
        }
      });
    }
  }, [scene]);

  return (
    <Center scale={3.5}>
      <primitive object={scene} />
    </Center>
  );
};

const ProductModal = ({ product, isOpen, onClose, onAddToCart }) => {
  const [selectedSize, setSelectedSize] = useState('M');
  const [viewMode, setViewMode] = useState('2D'); 

  if (!isOpen || !product) return null;

  const sizes = ['S', 'M', 'L', 'XL'];

  const handleClose = () => {
    setViewMode('2D'); 
    onClose();
  };

  return (
    <div className="modal-overlay">
      {/* Backdrop */}
      <div className="modal-backdrop" onClick={handleClose} />

      {/* Modal Container */}
      <div className="modal-container">
        
        {/* Close Button */}
        <button onClick={handleClose} className="modal-close-btn">
          [✕]
        </button>

        {/* Visual Section: Image or 3D Canvas */}
        <div className="modal-visual-section">
          
          <button onClick={() => setViewMode(viewMode === '2D' ? '3D' : '2D')} className="modal-view-toggle">
            {viewMode === '2D' ? 'View in 3D' : 'View 2D Image'}
          </button>

          {viewMode === '2D' ? (
            <img 
              src={product.images && product.images[0] ? product.images[0] : ''} 
              alt={product.name}
              className="modal-image" 
            />
          ) : (
            <div className="modal-3d-canvas">
              <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
                <ambientLight intensity={1} />
                <directionalLight position={[10, 10, 5]} intensity={2} />
                
                <ModalClothingModel />

                <OrbitControls 
                  enableZoom={true} 
                  enablePan={false} 
                  autoRotate 
                  autoRotateSpeed={2}
                  maxPolarAngle={Math.PI / 1.5} 
                  minPolarAngle={Math.PI / 3} 
                />
                <Environment preset="city" />
              </Canvas>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="modal-content-section">
          <div>
            <p className="modal-category">{product.category || 'Apparel'}</p>
            <h2 className="modal-title">{product.name}</h2>
            <p className="modal-price">${product.price}</p>
            <p className="modal-desc">{product.description}</p>

            {/* Behavioral Nudge: Scarcity Trigger */}
            <div className="modal-scarcity">
              <span className="modal-scarcity-dot" />
              <span className="modal-scarcity-text">High Demand: Only 2 left in stock</span>
            </div>

            {/* Size Selector */}
            <div className="modal-size-container">
              <label className="modal-size-label">Select Size</label>
              <div className="modal-size-grid">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`modal-size-btn ${selectedSize === size ? 'active' : ''}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button 
            onClick={() => {
              onAddToCart({ ...product, selectedSize });
              handleClose();
            }}
            className="modal-add-btn"
          >
            Add to Bag — ${product.price}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;