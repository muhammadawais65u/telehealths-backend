/**
 * Generate SEO-friendly slug from text
 * @param {string} text - Text to convert to slug
 * @param {string} suffix - Optional suffix to append
 * @returns {string} - Generated slug
 */
export const generateSlug = (text, suffix = '') => {
  if (!text) return '';
  
  // Convert to lowercase
  let slug = text.toLowerCase();
  
  // Replace spaces and special characters with hyphens
  slug = slug
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  
  // Add suffix if provided
  if (suffix) {
    slug = `${slug}-${suffix}`;
  }
  
  return slug;
};

/**
 * Generate unique slug by checking against existing slugs
 * @param {string} text - Text to convert to slug
 * @param {Array} existingSlugs - Array of existing slugs to check against
 * @returns {string} - Unique slug
 */
export const generateUniqueSlug = (text, existingSlugs = []) => {
  let baseSlug = generateSlug(text);
  let slug = baseSlug;
  let counter = 1;

  // Keep incrementing counter until we find a unique slug
  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

/**
 * Generate unique slug by checking against database model
 * @param {Model} model - Sequelize model to check against
 * @param {string} text - Text to convert to slug
 * @returns {Promise<string>} - Unique slug
 */
export const generateUniqueSlugFromModel = async (model, text) => {
  let baseSlug = generateSlug(text);
  let slug = baseSlug;
  let counter = 1;

  // Keep incrementing counter until we find a unique slug in the database
  while (true) {
    const existing = await model.findOne({ where: { slug } });
    if (!existing) {
      return slug;
    }
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
};

/**
 * Generate slug with timestamp for uniqueness
 * @param {string} text - Text to convert to slug
 * @returns {string} - Slug with timestamp
 */
export const generateSlugWithTimestamp = (text) => {
  const timestamp = Date.now();
  return generateSlug(text, timestamp);
};
