import { useMemo, type CSSProperties } from 'react';

import cx from 'classnames';

import styles from './LoadingOverlay.module.scss';

type Props = {
    loading?: boolean;
};

export function LoadingOverlay({ loading }: Props) {
    const overlayStyle: CSSProperties = useMemo(
        () =>
            loading
                ? {
                      width: '100%',
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  }
                : {
                      width: 0,
                      backgroundColor: 'rgba(0,0,0,0)',
                  },
        [loading],
    );

    return (
        <>
            <div
                className={cx(
                    'fixed inset-0 z-[97] block h-full transition-colors duration-300 ease-linear',
                    loading ? 'w-full bg-[rgba(255,255,255,0.3)] backdrop-blur-sm' : 'w-0',
                )}
                // style={overlayStyle}
            />
            {loading && (
                <div className='fixed left-1/2 top-1/2 z-[100] -translate-x-1/2 -translate-y-1/2'>
                    <div className={styles.loader} />
                    <p className='mt-4 font-bold text-accent1 text-body-1'>잠시만 기다려주세요...</p>
                </div>
            )}
        </>
    );
}
