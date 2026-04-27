import React from 'react';
import ImageFallback from '../ImageFallback';

export interface AvatarProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null;
  alt: string;
  wrapperClassName?: string;
}

export function Avatar({ src, alt, wrapperClassName, ...props }: AvatarProps) {
  return (
    <ImageFallback
      src={src}
      alt={alt}
      variant="avatar"
      wrapperClassName={wrapperClassName}
      {...props}
    />
  );
}

export default Avatar;
