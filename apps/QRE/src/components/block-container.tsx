import './block-container.scss';

export const BlockContainer = (props: { title?: React.ReactNode; className?: string; children: React.ReactNode }) => {
    return (
        <div className={"block-container " + (props.className ?? '')}>
            <div className="block-top" />
            <div className="block-inner-container">
                <div className="block-title">{props.title}</div>
                {props.children}
            </div>
        </div>
    );
};
