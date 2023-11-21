import report from "../../assets/example-report.json";
import DetailsCard from "../../components/details-card/DetailsCard";

const Home = (): JSX.Element => {
  return (
    <div>
      {Object.entries(report).map(([name, item]) => (
        <DetailsCard
          key={name}
          data={{
            name,
            count: item.instances,
            props: item.props,
          }}
        />
      ))}
    </div>
  );
};

export default Home;
