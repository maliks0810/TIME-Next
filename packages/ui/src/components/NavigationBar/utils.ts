
// ML: TODO - look into moving this into a global util function
export function fireAndForget<T>(fn: () => Promise<T> | T) {
    try {
        const maybePromise = fn();
        if (maybePromise && typeof (maybePromise as any).then === 'function') {
            (maybePromise as Promise<T>).catch((err) => {
                console.error('fire and forget update failed', err);
            });
        }
    } catch (err) {
        console.error('fire and forget update threw error', err);
    }
}