import React from "react";
import styled from "styled-components";

type ComponentData = {
  name: string;
  count: number;
  props: Record<string, number>;
};

type DetailsCardProps = {
  data: ComponentData;
};

export const DetailsCard = ({ data }: DetailsCardProps): JSX.Element => {
  return (
    <CardContainer>
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
    </CardContainer>
  );
};

const CardContainer = styled.div`
  background-color: lightgray;
  border-radius: 4px;
`;
