import { useMemo, type ReactNode, useCallback, type MouseEventHandler, useEffect, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';

import { useModal } from './context';

export default function Modal({
    title,
    content,
    onCancel,
    onOk,
    cancelText,
    okText,
}: {
    title?: ReactNode;
    content: ReactNode;
    onCancel?: MouseEventHandler<HTMLButtonElement>;
    onOk?: MouseEventHandler<HTMLButtonElement>;
    cancelText?: string;
    okText?: string;
}) {
    const { modalOpen, handleCloseModal } = useModal();

    const [modalRoot, setModalRoot] = useState<Element | null>(null);

    const handleClickOverlay = useCallback<MouseEventHandler<HTMLDivElement>>(
        e => {
            e.preventDefault();
            handleCloseModal();
        },
        [handleCloseModal],
    );

    const handleClickCancel = useCallback<MouseEventHandler<HTMLButtonElement>>(
        e => {
            e.preventDefault();
            onCancel && onCancel(e);
            handleCloseModal();
        },
        [handleCloseModal, onCancel],
    );

    const handleClickOk = useCallback<MouseEventHandler<HTMLButtonElement>>(
        e => {
            e.preventDefault();
            onOk && onOk(e);
            handleCloseModal();
        },
        [handleCloseModal, onOk],
    );

    const modalStyle: CSSProperties = useMemo(
        () =>
            modalOpen
                ? {
                      width: '100%',
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  }
                : {
                      width: 0,
                      backgroundColor: 'rgba(0,0,0,0)',
                  },
        [modalOpen],
    );

    const modalBoxStyle: CSSProperties = useMemo(
        () =>
            modalOpen
                ? {
                      display: 'block',
                  }
                : {
                      display: 'none',
                  },
        [modalOpen],
    );

    useEffect(() => {
        if (document) {
            setModalRoot(document.getElementById('modal-root'));
        }
    }, []);

    if (!modalRoot) return null;

    return createPortal(
        <>
            <div
                className='fixed inset-0 z-[97] block h-full transition-colors duration-300 ease-linear'
                onClick={handleClickOverlay}
                style={modalStyle}
            />
            <div
                className='fixed left-1/2 top-1/2 z-[99] hidden w-full max-w-[540px] -translate-x-1/2 -translate-y-1/2 overflow-y-hidden rounded-md bg-white p-10'
                style={modalBoxStyle}
            >
                {title && <div className='whitespace-pre-wrap font-noto font-bold text-black text-head-2'>{title}</div>}
                <div className='mt-2.5 whitespace-pre-wrap break-keep font-noto text-neutral1 text-body-1'>{content}</div>
                <div className='mt-10 flex justify-end gap-2.5'>
                    <button className='btn btn-small btn-outlined' onClick={handleClickCancel}>
                        {cancelText || '취소'}
                    </button>
                    <button className='btn btn-small btn-contained' onClick={handleClickOk}>
                        {okText || '확인'}
                    </button>
                </div>
            </div>
        </>,
        modalRoot,
    );
}
