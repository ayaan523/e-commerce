const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2';

const getImageSource = (image) => {
  if (!image) return FALLBACK_IMAGE;
  if (typeof image === 'string') return image;
  if (image.url) return image.url;
  if (image.data && image.contentType) {
    const data = Array.isArray(image.data)
      ? btoa(String.fromCharCode(...image.data))
      : image.data;
    return `data:${image.contentType};base64,${data}`;
  }
  if (image.$binary?.base64 && image.$binary.subType) {
    return `data:image/${image.$binary.subType};base64,${image.$binary.base64}`;
  }
  return FALLBACK_IMAGE;
};

const ProductCard = ({ product, onAddToCart }) => {
  if (!product) return null;

  const isRestricted = product.status === 'OUT_OF_STOCK' || product.status === 'UPCOMING';
  const image = Array.isArray(product.images) ? product.images[0] : product.images;
  const formattedPrice = `$${Number(product.price || 0).toFixed(2)}`;

  return (
    <article className="product-card-wrapper">
      <div className="product-image-container">
        <img className="product-image" src={getImageSource(image)} alt={product.name || 'Product'} />
        <div className="product-overlay-title"><h3>{product.name}</h3></div>
        <div className="product-badge">{isRestricted ? product.status.replace('_', ' ') : 'IN STOCK'}</div>
        <div className="product-hover-action">
          <button className="quick-add-btn" disabled={isRestricted} onClick={onAddToCart}>
            {isRestricted ? `Unavailable - ${formattedPrice}` : `Quick Add - ${formattedPrice}`}
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;