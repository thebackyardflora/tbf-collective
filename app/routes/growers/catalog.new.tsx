import { PageWrapper } from '~/components/PageWrapper';
import { ValidatedForm } from 'remix-validated-form';
import { catalogItemFormValidator, handleCatalogItemForm } from '~/forms/catalog-item';
import { Button, RVFButton, RVFInput, RVFTextArea } from '@mando-collabs/tailwind-ui';
import type { ActionArgs } from '@remix-run/node';
import { requireActiveCompany } from '~/session.server';
import { CompanyType } from '@prisma/client';
import type { FC } from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/outline';
import { useEffect, useRef, useState } from 'react';
import { createFileUploadHandler } from '~/utils';
import { unstable_parseMultipartFormData as parseMultipartFormData } from '@remix-run/server-runtime';

export async function action({ request }: ActionArgs) {
  const { user } = await requireActiveCompany(request, CompanyType.GROWER);

  const uploadHandler = createFileUploadHandler('images', 'catalog-items');
  const formData = await parseMultipartFormData(request, uploadHandler);

  return await handleCatalogItemForm(formData, user.id, '/growers/catalog');
}

export default function NewCatalogItem() {
  return (
    <PageWrapper
      title="New Catalog Item"
      breadcrumbs={[
        { name: 'Catalog', href: '../catalog' },
        { name: 'New Item', href: '#' },
      ]}
    >
      <ValidatedForm
        method="post"
        validator={catalogItemFormValidator}
        className="mt-4 space-y-4"
        encType="multipart/form-data"
      >
        <RVFInput
          type="text"
          name="name"
          label="Flower family name"
          helpText="Enter the name of the flower family (e.g. Dahlia)"
        />

        <RVFTextArea name="description" helpText="Enter a description of the flower" label="Description" />

        <ImageList />

        <RVFButton>Create</RVFButton>
      </ValidatedForm>
    </PageWrapper>
  );
}

const ImageList: FC = () => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<File[]>([]);

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

  useEffect(() => {
    console.log(inputRef.current?.files);
  }, [files]);

  return (
    <>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8">
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
    </>
  );
};
