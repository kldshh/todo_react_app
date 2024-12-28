import {
  Button,
  Container,
  Text,
  Title,
  Modal,
  TextInput,
  Group,
  Card,
  ActionIcon,
  Select,
} from "@mantine/core";
import { useState, useRef, useEffect } from "react";
import { MoonStars, Sun, Trash } from "tabler-icons-react";

import { MantineProvider, ColorSchemeProvider } from "@mantine/core";
import { useHotkeys, useLocalStorage } from "@mantine/hooks";

export default function App() {
  const [opened, setOpened] = useState(false);
  const [tasks, setTasks] = useState([]);

  const [colorScheme, setColorScheme] = useLocalStorage({
    key: "mantine-color-scheme",
    defaultValue: "light",
    getInitialValueInEffect: true,
  });
  const toggleColorScheme = (value) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

  useHotkeys([["mod+J", () => toggleColorScheme()]]);

  const taskTitle = useRef("");
  const taskSummary = useRef("");
  const taskState = useRef("");
  const taskDeadline = useRef(""); // Add deadline input ref

  function createTask() {
    if (!taskTitle.current.value || !taskState.current.value) {
      alert("Please fill in all fields");
      return;
    }

    setTasks([
      ...tasks,
      {
        title: taskTitle.current.value,
        summary: taskSummary.current.value,
        state: taskState.current.value,
        deadline: taskDeadline.current.value, // Set deadline from input
      },
    ]);
    saveTasks([
      ...tasks,
      {
        title: taskTitle.current.value,
        summary: taskSummary.current.value,
        state: taskState.current.value,
        deadline: taskDeadline.current.value, // Set deadline from input
      },
    ]);

    setOpened(false);
    taskTitle.current.value = "";
    taskSummary.current.value = "";
    taskState.current.value = "";
    taskDeadline.current.value = ""; // Clear deadline input
  }

  function deleteTask(index) {
    const updatedTasks = tasks.filter((_, i) => i !== index);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  }

  function loadTasks() {
    try {
      const storedTasks = localStorage.getItem("tasks");
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
    } catch (error) {
      console.error("Error loading tasks from localStorage:", error);
      setTasks([]);
    }
  }

  function saveTasks(tasks) {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  function sortTasks(target) {
    const sortedTasks = [...tasks];
    if (target === "deadline") {
      sortedTasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    } else {
      sortedTasks.sort((a, b) => {
        if (a.state === target) return -1;
        if (b.state === target) return 1;
        return a.title.localeCompare(b.title);
      });
    }
    setTasks(sortedTasks);
  }

  function filterTasks(state) {
    const filteredTasks = tasks.filter((task) => task.state === state);
    setTasks(filteredTasks);
  }

  useEffect(() => {
    loadTasks();
  }, []);

  return (
    <ColorSchemeProvider
      colorScheme={colorScheme}
      toggleColorScheme={toggleColorScheme}
    >
      <MantineProvider
        theme={{ colorScheme, defaultRadius: "md" }}
        withGlobalStyles
        withNormalizeCSS
      >
        <div className="App">
          <Modal
            opened={opened}
            size={"md"}
            title={"New Task"}
            withCloseButton={false}
            onClose={() => setOpened(false)}
            centered
          >
            <TextInput
              mt={"md"}
              ref={taskTitle}
              placeholder={"Task Title"}
              required
              label={"Title"}
            />
            <TextInput
              ref={taskSummary}
              mt={"md"}
              placeholder={"Task Summary"}
              label={"Summary"}
            />
            <Select
              mt={"md"}
              ref={taskState}
              label="State"
              placeholder="Select task state"
              data={[
                { value: "done", label: "Done" },
                { value: "not_done", label: "Not done" },
                { value: "doing", label: "Doing right now" },
              ]}
            />
            <TextInput
              mt={"md"}
              type="date"
              ref={taskDeadline} // Add ref to deadline input
              placeholder="Deadline"
              label={"Deadline"}
            />
            <Group mt={"md"} position={"apart"}>
              <Button onClick={() => setOpened(false)} variant={"subtle"}>
                Cancel
              </Button>
              <Button onClick={createTask}>Create Task</Button>
            </Group>
          </Modal>
          <Container size={550} my={40}>
            <Group position={"apart"}>
              <Title
                sx={(theme) => ({
                  fontFamily: `Greycliff CF, ${theme.fontFamily}`,
                  fontWeight: 900,
                })}
              >
                My Tasks
              </Title>
              <ActionIcon
                color={"blue"}
                onClick={() => toggleColorScheme()}
                size="lg"
              >
                {colorScheme === "dark" ? <Sun size={16} /> : <MoonStars size={16} />}
              </ActionIcon>
            </Group>

            <Group position="apart" mt="md">
              <Button onClick={() => sortTasks("done")}>Show 'Done' first</Button>
              <Button onClick={() => sortTasks("doing")}>Show 'Doing' first</Button>
              <Button onClick={() => sortTasks("not_done")}>
                Show 'Not done' first
              </Button>
              <Button onClick={() => sortTasks("deadline")}>
                Sort by deadline
              </Button>
            </Group>
            <Group position="apart" mt="md">
              <Button onClick={() => filterTasks("done")}>Show only 'Done'</Button>
              <Button onClick={() => filterTasks("not_done")}>
                Show only 'Not done'
              </Button>
              <Button onClick={() => filterTasks("doing")}>
                Show only 'Doing'
              </Button>
              <Button
                onClick={() =>
                  setTasks(JSON.parse(localStorage.getItem("tasks")) || [])
                }
              >
                Clear Filter
              </Button>
            </Group>

            {tasks.length > 0 ? (
              tasks.map((task, index) => (
                <Card withBorder key={index} mt={"sm"}>
                  <Group position={"apart"}>
                    <Text weight={"bold"}>{task.title}</Text>
                    <ActionIcon
                      onClick={() => deleteTask(index)}
                      color={"red"}
                      variant={"transparent"}
                    >
                      <Trash />
                    </ActionIcon>
                  </Group>
                  <Text color={"dimmed"} size={"md"} mt={"sm"}>
                    {task.summary ? task.summary : "No summary was provided for this task"}
                  </Text>
                </Card>
              ))
            ) : (
              <Text size={"lg"} mt={"md"} color={"dimmed"}>
                You have no tasks
              </Text>
            )}
            <Button onClick={() => setOpened(true)} fullWidth mt={"md"}>
              New Task
            </Button>
          </Container>
        </div>
      </MantineProvider>
    </ColorSchemeProvider>
  );
}