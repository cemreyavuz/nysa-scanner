import data from "../../assets/example-report.json";
import { DetailsCard } from "../../components/details-card/DetailsCard.tsx";

const report = data[0].reports[0];

export const Home = (): JSX.Element => {
  return (
    <div>
      {report.imports.map(({ name, instances, props }) => (
        <DetailsCard
          key={name}
          data={{
            name,
            count: instances,
            props,
          }}
        />
      ))}
    </div>
  );
};
