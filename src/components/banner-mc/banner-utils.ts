import { getAssetPath } from '@stencil/core';
import { ImageResources } from '../../constant/Resources';

export function getImagePath(imageName: string) {
  return getAssetPath(ImageResources[imageName]);
}
