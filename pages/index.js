import parse from 'co-body';
import { useRouter } from 'next/router';

const Form = ({ method = 'get', onSubmit, ...props }) => {
  const router = useRouter();
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const body = new URLSearchParams(formData);

    if (method.toLowerCase() === 'post') {
      await fetch(router.asPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });

      await router.replace(router.asPath);
    }

    onSubmit && (await onSubmit(e));

    const query = Object.fromEntries(body);
    await router.push({ query });
  };
  return <form {...props} method={method} onSubmit={handleSubmit} />;
};

export default function Todos({ todos }) {
  return (
    <div className="container mx-auto max-w-3xl p-4 flex flex-col space-y-6">
      <h1>Todos</h1>

      <h2>Add Todo</h2>

      <Form
        method="post"
        className="flex space-x-2"
        onSubmit={(e) => {
          e.target.title.value = '';
        }}
      >
        <input
          type="text"
          name="title"
          placeholder="Title"
          className="flex-1"
        />
        <input type="hidden" name="action" value="create" />
        <button>Add Todo</button>
      </Form>

      <ul className="space-y-4">
        {todos.map((todo) => (
          <li key={todo.id} className="shadow-md p-4">
            <Form method="post" className="flex space-x-2 items-center">
              <button className="bg-red-500 hover:bg-red-700">
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
              </button>

              <span>
                {todo.completed ? <strike>{todo.title}</strike> : todo.title}
              </span>

              <input type="hidden" name="id" value={todo.id} />
              <input type="hidden" name="action" value="delete" />
            </Form>
          </li>
        ))}
      </ul>

      <ul className="flex space-x-1">
        <li>
          <Form method="get">
            <button>All</button>
          </Form>
        </li>
        <li>
          <Form method="get">
            <input type="hidden" name="completed" value="false" />
            <button>Active</button>
          </Form>
        </li>
        <li>
          <Form method="get">
            <input type="hidden" name="completed" value="true" />
            <button>Completed</button>
          </Form>
        </li>
      </ul>
    </div>
  );
}

export async function getServerSideProps({ req, query }) {
  if (req.method.toLowerCase() === 'post') {
    const { action, ...body } = await parse.form(req);

    if (action === 'create') {
      await fetch('http://localhost:8080/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
    }

    if (action === 'delete') {
      await fetch(`http://localhost:8080/todos/${body.id}`, {
        method: 'DELETE',
      });
    }
  }

  const { completed } = query;

  const todos = await fetch(
    'http://localhost:8080/todos?_sort=id&_order=desc'
  ).then((res) => res.json());

  return {
    props: {
      todos: todos.filter((todo) => {
        if (completed === 'true') {
          return todo.completed;
        }

        if (completed === 'false') {
          return !todo.completed;
        }

        return true;
      }),
    },
  };
}
