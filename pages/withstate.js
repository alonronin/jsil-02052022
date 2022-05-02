import { useEffect, useState } from 'react';

export default function Todos() {
  const [todos, setTodos] = useState([]);
  const [completed, setCompleted] = useState('');

  const fetchTodos = () => {
    fetch('http://localhost:8080/todos')
      .then((res) => res.json())
      .then((todos) => setTodos(todos));
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  return (
    <div className="container mx-auto max-w-3xl p-4 flex flex-col space-y-6">
      <h1>Todos</h1>

      <h2>Add Todo</h2>

      <form
        className="flex space-x-2"
        onSubmit={async (e) => {
          e.preventDefault();
          await fetch('http://localhost:8080/todos', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title: e.target.title.value,
            }),
          });

          e.target.title.value = '';

          await fetchTodos();
        }}
      >
        <input type="text" name="title" className="flex-1" />
        <button>Add Todo</button>
      </form>

      <ul className="space-y-4">
        {todos
          .filter((todo) => {
            if (completed === 'true') {
              return todo.completed;
            }

            if (completed === 'false') {
              return !todo.completed;
            }

            return true;
          })
          .map((todo) => (
            <li key={todo.id} className="shadow-md p-4">
              <button
                onClick={async () => {
                  await fetch(`http://localhost:8080/todos/${todo.id}`, {
                    method: 'DELETE',
                  });

                  await fetchTodos();
                }}
                className="bg-red-500 hover:bg-red-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>{' '}
              {todo.completed ? <strike>{todo.title}</strike> : todo.title}
            </li>
          ))}
      </ul>
      <ul className="flex space-x-1">
        <li>
          <button onClick={() => setCompleted('')}>All</button>
        </li>
        <li>
          <button onClick={() => setCompleted('true')}>Active</button>
        </li>
        <li>
          <button onClick={() => setCompleted('false')}>Completed</button>
        </li>
      </ul>
    </div>
  );
}
