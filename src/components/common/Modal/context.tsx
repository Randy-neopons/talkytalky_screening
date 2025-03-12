// context/ModalContext.tsx
import { createContext, type FC, useContext, type ReactNode, useState, useCallback, type MouseEventHandler } from 'react';

import Modal from '.';

type ModalProps = {
    title?: ReactNode;
    content: ReactNode;
    onCancel?: MouseEventHandler<HTMLButtonElement>;
    onOk?: MouseEventHandler<HTMLButtonElement>;
    cancelText?: string;
    okText?: string;
};

interface ModalContextType {
    modalOpen: boolean;
    handleOpenModal: ({ title, content, onCancel, onOk, cancelText, okText }: ModalProps) => void;
    handleCloseModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
    const context = useContext(ModalContext);
    if (context === undefined) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
};

export const ModalProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [modalOpen, setModalOpen] = useState(false);

    const [modalProps, setModalProps] = useState<ModalProps>({
        content: null,
    });

    const handleOpenModal = useCallback(({ title, content, onCancel, onOk, cancelText, okText }: ModalProps) => {
        setModalProps({
            title,
            content,
            onCancel,
            onOk,
            cancelText,
            okText,
        });

        setModalOpen(true);
    }, []);
    const handleCloseModal = useCallback(() => {
        setModalOpen(false);
    }, []);

    return (
        <ModalContext.Provider value={{ modalOpen, handleOpenModal, handleCloseModal }}>
            {children}
            <Modal {...modalProps} />
        </ModalContext.Provider>
    );
};
