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
import { MoonStars, Sun, Trash, Edit } from "tabler-icons-react";

import { MantineProvider, ColorSchemeProvider } from "@mantine/core";
import { useHotkeys, useLocalStorage } from "@mantine/hooks";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [opened, setOpened] = useState(false);
  const [editOpened, setEditOpened] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
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
  const taskState = useRef("Not done");
  const taskDeadline = useRef(null);

  
  function createTask() {
    const newTask = {
      title: taskTitle.current.value,
      summary: taskSummary.current.value,
      state: taskState.current,
      deadline: taskDeadline.current.value, 
    };
  
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    setOpened(false);

  }
  
  function updateTask(index, updatedTask) {
    const clonedTasks = [...tasks];
    clonedTasks[index] = updatedTask;
    setTasks(clonedTasks);
    saveTasks(clonedTasks);
  }
  
  function saveTasks(tasks) {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }
  
  function deleteTask(index) {
    const clonedTasks = [...tasks];
    clonedTasks.splice(index, 1);
    setTasks(clonedTasks);
    saveTasks(clonedTasks);
  }
  
  function saveTasks(tasks) {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  

  function loadTasks() {
    let loadedTasks = localStorage.getItem("tasks");
    let tasks = JSON.parse(loadedTasks);
    if (tasks) {
      setTasks(tasks);
    }
  }

  function saveTasks(tasks) {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  useEffect(() => {
    loadTasks();
  }, []);

  function sortTasks(criteria) {
    const sortedTasks = [...tasks].sort((a, b) => {
      if (criteria === "deadline") {
        return new Date(a.deadline) - new Date(b.deadline);
      }
      return a.state === criteria ? -1 : 1;
    });
    setTasks(sortedTasks);
  }
  function sortTasksByDeadline() {
    const sortedTasks = [...tasks].sort((a, b) =>
      new Date(a.deadline) - new Date(b.deadline)
    );
    setTasks(sortedTasks);
  }
  
  function filterTasks(state) {
    loadTasks();
    setTasks((prev) => prev.filter((task) => task.state === state));
  }

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
            withCloseButton
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
              data={["Done", "Not done", "Doing right now"]}
              label="State"
              onChange={(value) => (taskState.current = value)}
            />
            <TextInput
                mt={"md"}
                type="date"
                ref={taskDeadline}
                placeholder={"Select Deadline"}
                label={"Deadline"}
                required
              />

            <Group mt={"md"} position={"apart"}>
              <Button onClick={() => setOpened(false)} variant={"subtle"}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  createTask();
                  taskTitle.current.value = "";
                  taskSummary.current.value = "";
                }}
              >
                Create Task
              </Button>
            </Group>
          </Modal>

          <Modal
            opened={editOpened}
            size={"md"}
            title={"Edit Task"}
            withCloseButton
            onClose={() => setEditOpened(false)}
            centered
          >
            {currentTask && (
              <>
                <TextInput
                  mt={"md"}
                  defaultValue={currentTask.title}
                  onChange={(event) => (currentTask.title = event.target.value)}
                  label={"Title"}
                />
                <TextInput
                  mt={"md"}
                  defaultValue={currentTask.summary}
                  onChange={(event) => (currentTask.summary = event.target.value)}
                  label={"Summary"}
                />
                <Select
                  mt={"md"}
                  data={["Done", "Not done", "Doing right now"]}
                  defaultValue={currentTask.state}
                  onChange={(value) => (currentTask.state = value)}
                  label="State"
                />
                <TextInput
                  mt={"md"}
                  type="date"
                  ref={taskDeadline}
                  placeholder={"Select Deadline"}
                  label={"Deadline"}
                  required
                />

                <Group mt={"md"} position={"apart"}>
                  <Button
                    onClick={() => {
                      updateTask(tasks.indexOf(currentTask), currentTask);
                      setEditOpened(false);
                    }}
                  >
                    Save Changes
                  </Button>
                </Group>
              </>
            )}
          </Modal>

          <Container size={550} my={40}>
            <Group position="apart">
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
                {colorScheme === "dark" ? (
                  <Sun size={16} />
                ) : (
                  <MoonStars size={16} />
                )}
              </ActionIcon>
            </Group>
            <Group position="apart" mt="md">
              <Button onClick={() => sortTasks("Done")}>Show "Done" first</Button>
              <Button onClick={() => sortTasks("Doing right now")}>
                Show "Doing" first
              </Button>
              <Button onClick={() => sortTasks("Not done")}>
                Show "Not done" first
              </Button>
              
              <Button onClick={sortTasksByDeadline}>Sort by Deadline</Button>;

            </Group>
            <Group position="apart" mt="md">
              <Button onClick={() => filterTasks("Done")}>Show only "Done"</Button>
              <Button onClick={() => filterTasks("Doing right now")}>
                Show only "Doing"
              </Button>
              <Button onClick={() => filterTasks("Not done")}>
                Show only "Not done"
              </Button>
            </Group>
            {tasks.length > 0 ? (
              tasks.map((task, index) => (
                <Card withBorder key={index} mt={"sm"}>
                  <Group position={"apart"}>
                    <Text weight={"bold"}>{task.title}</Text>
                    <Group>
                      <ActionIcon
                        onClick={() => {
                          setCurrentTask(task);
                          setEditOpened(true);
                        }}
                        color={"blue"}
                        variant={"transparent"}
                      >
                        <Edit />
                      </ActionIcon>
                      <ActionIcon
                        onClick={() => deleteTask(index)}
                        color={"red"}
                        variant={"transparent"}
                      >
                        <Trash />
                      </ActionIcon>
                    </Group>
                  </Group>
                  <Text color={"dimmed"} size={"md"} mt={"sm"}>
                    {task.summary || "No summary provided for this task"}
                  </Text>
                  <Text color={"dimmed"} size={"sm"} mt={"xs"}>
                    State: {task.state}
                  </Text>
                  {task.deadline && (
                    <Text color={"dimmed"} size={"sm"} mt={"xs"}>
                      Deadline: {new Date(task.deadline).toLocaleDateString()}
                    </Text>
                  )}
                </Card>
              ))
            ) : (
              <Text size={"lg"} mt={"md"} color={"dimmed"}>
                You have no tasks
              </Text>
            )}
            <Button
              onClick={() => setOpened(true)}
              fullWidth
              mt={"md"}
            >
              New Task
            </Button>
          </Container>
        </div>
      </MantineProvider>
    </ColorSchemeProvider>
  );
}
