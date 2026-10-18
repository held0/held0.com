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
            <a href={p.href}>{p.name}</a>
            <p>{p.description}</p>
          </li>
        ))}
      </ul>
    </>
  );
}
