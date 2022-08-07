import type { FC } from 'react';
import { useRef, useState } from 'react';
import { catalogItemFormValidator } from '~/forms/catalog-item';
import { Button, RVFButton, RVFInput, RVFTextArea } from '@mando-collabs/tailwind-ui';
import { ValidatedForm } from 'remix-validated-form';
import { PlusIcon, TrashIcon } from '@heroicons/react/outline';
import classNames from 'classnames';

export interface CatalogFormProps {
  initialValues?: {
    name: string;
    description: string | null;
    basePrice: number | null;
    images: {
      id: string;
      url: string;
    }[];
  };
  mode?: 'CREATE' | 'EDIT';
  flowerType?: 'Species' | 'Variety';
}

export const CatalogForm: FC<CatalogFormProps> = ({ initialValues, mode = 'CREATE', flowerType = 'Species' }) => {
  return (
    <ValidatedForm
      method="post"
      validator={catalogItemFormValidator}
      defaultValues={
        initialValues
          ? {
              name: initialValues.name,
              description: initialValues.description ?? undefined,
              basePrice: initialValues.basePrice ?? undefined,
            }
          : undefined
      }
      className="mt-4 space-y-4"
      encType="multipart/form-data"
    >
      <RVFInput
        type="text"
        name="name"
        label={`${flowerType} name`}
        helpText={`Enter the common name of the flower ${flowerType.toLowerCase()}`}
      />

      <RVFInput
        type="number"
        name="basePrice"
        label="Minimum Price Per Stem"
        helpText="Enter the collective's minimum price for this flower."
        leadingAddon="$"
        step={0.01}
        pattern="^\d+(\.\d{1,2})?$"
      />

      <RVFTextArea
        name="description"
        helpText={`Enter a description of the ${flowerType.toLowerCase()}`}
        label="Description"
      />

      <ImageList initialImages={initialValues?.images ?? []} />

      <RVFButton>{mode === 'CREATE' ? 'Create' : 'Update'}</RVFButton>
    </ValidatedForm>
  );
};

const ImageList: FC<{ initialImages: { id: string; url: string }[] }> = ({ initialImages }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [imagesToRemove, setImagesToRemove] = useState<string[]>([]);

  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const dataTransfer = new DataTransfer();

    for (const file of files) {
      dataTransfer.items.add(file);
    }

    for (const file of event.target.files ?? []) {
      const hasFile = !!files.find((f) => f.name === file.name);
      if (!hasFile) {
        dataTransfer.items.add(file);
      }
    }

    event.target.files = dataTransfer.files;
    setFiles(Array.from(dataTransfer.files));
  };

  const removeFile = (fileName: string) => {
    if (!inputRef.current) return;

    const dataTransfer = new DataTransfer();

    for (const file of files) {
      if (file.name !== fileName) {
        dataTransfer.items.add(file);
      }
    }

    inputRef.current.files = dataTransfer.files;
    setFiles(Array.from(dataTransfer.files));
  };

  function removeExistingImage(id: string) {
    setImagesToRemove((imagesToRemove) => [...imagesToRemove, id]);
  }

  function undoRemoveExistingImage(id: string) {
    setImagesToRemove((imagesToRemove) => imagesToRemove.filter((k) => k !== id));
  }

  return (
    <>
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4 xl:gap-8">
        {initialImages.map((image) => (
          <li key={image.id} className="relative">
            <div className="group aspect-w-10 aspect-h-7 block w-full overflow-hidden rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100">
              <img
                src={image.url}
                alt=""
                className={classNames(
                  'pointer-events-none object-cover',
                  imagesToRemove.includes(image.id) ? 'opacity-25' : null
                )}
              />
            </div>
            <Button
              type="button"
              className="absolute top-2 right-2"
              leadingIcon={TrashIcon}
              kind={imagesToRemove.includes(image.id) ? 'destructive' : 'white'}
              size="xs"
              onClick={() => {
                imagesToRemove.includes(image.id) ? undoRemoveExistingImage(image.id) : removeExistingImage(image.id);
              }}
            />
          </li>
        ))}
        {files.map((file) => (
          <li key={file.name} className="relative">
            <div className="group aspect-w-10 aspect-h-7 block w-full overflow-hidden rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100">
              <img
                src={URL.createObjectURL(file)}
                alt=""
                className="pointer-events-none object-cover group-hover:opacity-75"
              />
              <button type="button" className="absolute inset-0 focus:outline-none" />
            </div>
            <Button
              type="button"
              className="absolute top-2 right-2"
              leadingIcon={TrashIcon}
              kind="white"
              size="xs"
              onClick={() => removeFile(file.name)}
            />
            <p className="pointer-events-none mt-2 block truncate text-sm font-medium text-gray-900">{file.name}</p>
            <p className="pointer-events-none block text-sm font-medium text-gray-500">
              {Math.round((file.size / 1024 / 1024) * 100) / 100} MB
            </p>
          </li>
        ))}
        <li className="relative">
          <div className="group aspect-w-10 aspect-h-7 block w-full overflow-hidden rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100">
            <button
              type="button"
              className="absolute inset-0 flex items-center justify-center text-gray-500 focus:outline-none group-hover:bg-gray-200"
              onClick={() => inputRef.current?.click()}
            >
              <PlusIcon className="mr-2 h-6 w-6" />
              Add Image
            </button>
          </div>
        </li>
      </ul>
      <input
        ref={inputRef}
        type="file"
        accept="image/png, image/jpeg"
        className="hidden"
        multiple={true}
        name="images"
        onChange={handleFileSelection}
      />
      {imagesToRemove.map((key) => (
        <input type="hidden" name="imagesToRemove" value={key} key={key} />
      ))}
    </>
  );
};
