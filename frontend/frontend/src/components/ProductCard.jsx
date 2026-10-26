import React from 'react';
import '../App.css'; // Ensure it can see the CSS file

const ProductCard = ({ product, onAddToCart }) => {
  return (
    <div className="product-card-wrapper">
      <div className="product-image-container">
        
        <div className="product-overlay-title">
          <h3>{product.name}</h3>
        </div>

        {product.status && (
          <div className="product-badge">
            {product.status.replace('_', ' ')}
          </div>
        )}

        <img 
          src={product.images && product.images[0] ? product.images[0] : 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2'} 
          alt={product.name} 
          className="product-image"
        />

        <div className="product-hover-action">
          <button onClick={onAddToCart} className="quick-add-btn">
            Add — ${product.price}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;