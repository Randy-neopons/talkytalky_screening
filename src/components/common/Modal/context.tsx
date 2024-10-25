// context/ModalContext.tsx
import { createContext, type FC, useContext, type ReactNode, useState, useCallback, type MouseEventHandler } from 'react';

import Modal from '.';

interface ModalContextType {
    modalOpen: boolean;
    handleOpenModal: ({
        content,
        onCancel,
        onOk,
        cancelText,
        okText,
    }: {
        content: ReactNode;
        onCancel?: MouseEventHandler<HTMLButtonElement>;
        onOk: MouseEventHandler<HTMLButtonElement>;
        cancelText?: string;
        okText?: string;
    }) => void;
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

    const [modalProps, setModalProps] = useState<{
        content: ReactNode;
        onCancel?: MouseEventHandler<HTMLButtonElement>;
        onOk?: MouseEventHandler<HTMLButtonElement>;
        cancelText?: string;
        okText?: string;
    }>({
        content: null,
    });

    const handleOpenModal = useCallback(
        ({
            content,
            onCancel,
            onOk,
            cancelText,
            okText,
        }: {
            content: ReactNode;
            onCancel?: MouseEventHandler<HTMLButtonElement>;
            onOk?: MouseEventHandler<HTMLButtonElement>;
            cancelText?: string;
            okText?: string;
        }) => {
            setModalProps({
                content,
                onCancel,
                onOk,
                cancelText,
                okText,
            });

            setModalOpen(true);
        },
        [],
    );
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
