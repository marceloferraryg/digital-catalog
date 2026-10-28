import HeroHome from "../../components/home/hero";
import Categories from "@/components/home/categories";

export default function Home() {
  return (
    <div className="container ">
      <HeroHome />
      <Categories />
    </div>
  );
}
