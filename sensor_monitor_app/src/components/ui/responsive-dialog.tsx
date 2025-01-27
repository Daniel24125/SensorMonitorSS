import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { useMediaQuery } from '@/hooks/use-media-query';

export function ResponsiveDialog({
  children,
  isOpen,
  setIsOpen,
  title,
  description,
}: {
  children: React.ReactNode;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  title: string;
  description?: string;
}) {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen} modal>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer  open={isOpen} onOpenChange={setIsOpen}>
      <DrawerContent className='flex flex-col items-center ' >
        <DrawerHeader className="w-full text-left">
          <DrawerTitle>{title}</DrawerTitle>
          {description && <DrawerDescription>{description}</DrawerDescription>}
        </DrawerHeader>
        <div className="w-full sm:max-w-[425px] p-4" >
            {children}
        </div>
            <DrawerFooter className='w-full sm:max-w-[425px]'>
            <DrawerClose asChild>
                <Button className='w-full' variant="outline">Cancel</Button>
            </DrawerClose>
            </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}