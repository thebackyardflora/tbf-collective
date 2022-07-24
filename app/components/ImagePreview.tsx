import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { AvatarPlaceholder } from '~/components/AvatarPlaceholder';

export const ImagePreview: FC<{ imageUrl: string | null; file: File | null }> = ({ imageUrl, file }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  }, [file]);

  useEffect(() => {
    setPreviewUrl(imageUrl);
  }, [imageUrl]);

  const url = previewUrl ?? imageUrl;

  return url ? <img className="h-full w-full rounded-full object-cover" src={url} alt="" /> : <AvatarPlaceholder />;
};
