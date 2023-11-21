import React from "react";

type ComponentData = {
  name: string;
  count: number;
  props: Record<string, number>;
};

type DetailsCardProps = {
  data: ComponentData;
};

const DetailsCard = ({ data }: DetailsCardProps): JSX.Element => {
  return (
    <div>
      <h3>
        {data.name} - {data.count}
      </h3>
      <p>
        {Object.entries(data.props).map(([propName, count]) => (
          <React.Fragment key={`${data.name}-${propName}`}>
            {propName} ({count})&nbsp;
          </React.Fragment>
        ))}
      </p>
    </div>
  );
};

export default DetailsCard;
