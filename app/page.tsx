import { projects } from "./projects";

export default function Home() {
  return (
    <>
      <h1>
        held0<span>_</span>
      </h1>
      <ul>
        {projects.map((p) => (
          <li key={p.name}>
            <p>{`// ${p.description}`}</p>
            <a href={p.href}>{p.name}</a>
          </li>
        ))}
      </ul>
    </>
  );
}
