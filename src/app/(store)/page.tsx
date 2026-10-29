import HeroHome from "../../components/home/Hero";
import Categories from "@/components/home/Categories";
import AssistenceHome from "@/components/home/assistence";

export default function Home() {
  return (
    <div className="container">
      <HeroHome />
      <Categories />
      <AssistenceHome />
    </div>
  );
}
