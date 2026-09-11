import exifr from 'exifr';

/**
 * Extract photographic EXIF data from an image file buffer or path
 * @param {string|Buffer} source
 * @returns {Promise<Object>} Formatted camera and exposure metadata
 */
export async function extractExif(source) {
  try {
    const data = await exifr.parse(source, {
      pick: [
        'Make',
        'Model',
        'LensModel',
        'FNumber',
        'ExposureTime',
        'ISO',
        'FocalLength',
        'CreateDate',
        'latitude',
        'longitude',
        'ExposureProgram',
        'Flash'
      ]
    });

    if (!data) {
      return {
        camera: null,
        lens: null,
        focalLength: null,
        aperture: null,
        shutterSpeed: null,
        iso: null,
        year: new Date().getFullYear().toString()
      };
    }

    let shutterSpeed = null;
    if (data.ExposureTime) {
      if (data.ExposureTime < 1) {
        shutterSpeed = `1/${Math.round(1 / data.ExposureTime)}s`;
      } else {
        shutterSpeed = `${data.ExposureTime}s`;
      }
    }

    const camera = data.Model 
      ? (data.Make && !data.Model.includes(data.Make) ? `${data.Make} ${data.Model}` : data.Model)
      : null;

    return {
      camera,
      lens: data.LensModel || null,
      focalLength: data.FocalLength ? `${Math.round(data.FocalLength)}mm` : null,
      aperture: data.FNumber ? `f/${data.FNumber.toFixed(1)}` : null,
      shutterSpeed,
      iso: data.ISO ? `ISO ${data.ISO}` : null,
      year: data.CreateDate ? new Date(data.CreateDate).getFullYear().toString() : new Date().getFullYear().toString()
    };
  } catch (err) {
    console.warn('EXIF parse warning:', err.message);
    return {
      camera: null,
      lens: null,
      focalLength: null,
      aperture: null,
      shutterSpeed: null,
      iso: null,
      year: new Date().getFullYear().toString()
    };
  }
}
