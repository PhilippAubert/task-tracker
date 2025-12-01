/**
 * task-cli list done
 * task-cli list todo
 * task-cli list in-progress
*/

import {readFile, writeFile} from "node:fs/promises";

const getTasks = async () => {
    try {
        const data = await readFile("./tasks.txt", "utf-8");
        return JSON.parse(data);
    } catch {
        return [];
    }
};

const findIndexOfTask = async (input) => {
    const allTasks = await getTasks();
    const index = allTasks.findIndex(task => task.id === numericInput);
    if (index === -1) {
        return "no such id in the list";
    }
}

const createFile = async () => {
    try {
        await writeFile("./tasks.txt", JSON.stringify([], null, 2), "utf-8");
        return "File created successfully!";
    } catch (e) {
        console.error(e, " when writing file");
        return null;
    }
};

const handleOverride = async (updatedTasks) => {
    try {
        await writeFile("./tasks.txt", JSON.stringify(updatedTasks, null, 2), "utf-8");
    } catch (e) {
        process.stderr.write(e);
    }
}


const validateIdInput = (numericId) => {
    if (isNaN(numericId)) {
        process.stdout.write("Please provide a valid numeric id to delete.\n");
        return false;
    }
}

const addTask = async (task) => {
    try {
        const allTasks = await getTasks();

        const duplicates = allTasks.filter((todo) => todo.description === task.description);
        
        if (!allTasks && allTasks.length === 0) {
            const newFile = await createFile();
            return newFile ?? "Failed to create file!";
        } else if (duplicates.length > 0) {
            return "This task already exists!";
        } else {
            if (allTasks.length === 0) {
                task.id = 1;
            } else {
                task.id = Number(allTasks[allTasks.length - 1].id) + 1;
            }
            allTasks.push(task);
            await handleOverride(allTasks);
            return `Task ${task.id} appended successfully!`;
        }
    } catch (err) {
        console.error(err);
        return "Error when writing file!";
    }
};

const deleteTask = async (inputDescription) => {
    const numericInput = Number(inputDescription);
    const allTasks = await getTasks();

    const filteredTasks = allTasks.filter(task => task.id !== numericInput);
    const filteredTask = allTasks.filter(task => task.id === numericInput);
    const allTaskIds = allTasks.map((task) => {return task.id})
    
    if (filteredTasks.length === 0 && !filteredTask.length > 0) {
       return "Todo list is empty! \n";
    } else if (!allTaskIds.includes(numericInput)) {
        return "This id does not exist! \n";
    } else {
        await handleOverride(filteredTasks);
        return `Deleted Task ${filteredTask[0].description} \n`;
    }
};

const updateTask = async (inputDescription, updateValue) => {
    const allTasks = await getTasks();
    const index = findIndexOfTask(Number(inputDescription));
    const oldTask = allTasks[index];
    const updatedTask = {
      ...oldTask,
      description: updateValue
    };
    
    allTasks[index] = updatedTask;
  
    try {
        await handleOverride(allTasks);
        return `Task ${updatedTask.id} updated successfully!`
    } catch {
        process.stdout.write("failed to update!")
    }
}


const updateTaskByStatus = async (inputDescription, updateValue) => {
    const allTasks = await getTasks();
    const index = findIndexOfTask(Number(inputDescription));
    const oldTask = allTasks[index];
    const updatedTask = {
      ...oldTask,
      status: updateValue
    };
    
    allTasks[index] = updatedTask;
  
    try {
        await handleOverride(allTasks);
        return `Task ${updatedTask.id} set to ${updatedTask.status}`
    } catch {
        process.stdout.write("failed to update!")
    }
}

const listTasksByStatus = async (description) => {
    const allItems = await getTasks();
    const filteredTasks = allItems.filter(task => task.status === description);
    if (filteredTasks.length === 0) {
        return `No tasks by ${description}`;
    }

    const aggregateTasks = (filteredTasks) => {
        let arr = [];
        filteredTasks.forEach(task => arr.push(task.description));
        return arr;
    }

    const aggregatedTasks = aggregateTasks(filteredTasks);
    return {
        status: description,
        tasks: aggregatedTasks,
    }
}


const startApp = () => {
    process.stdin.setEncoding("utf-8");

    process.stdin.on("data", async (data) => {
        const input = data.toString().trim();
        if (!input) return;

        const tokens = input.split(" ");
        const inputType = tokens[0];
        const description = tokens.slice(1).join(" ");
        const idString = tokens[1];
        const numericId = Number(idString);

        switch (inputType) {
            case "add": {
                if (!description) {
                    process.stdout.write("Please provide a task description.\n");
                    break;
                }
                const task = { description, status: "todo" };
                const taskAdded = await addTask(task);
                process.stdout.write(`${taskAdded}\n`);
                break;
            }

            case "delete": {
                const isValid = validateIdInput(numericId);
                if (!isValid) {
                    const taskDeleted = await deleteTask(numericId);
                    process.stdout.write(`${taskDeleted}\n`);
                }
                break;
            }
            case "update": {
                const isValid = validateIdInput(numericId);
                if (!isValid) {
                    const updateValue = tokens.slice(2).join(" ");
                    const taskUpdated = await updateTask(numericId, updateValue);
                    process.stdout.write(`${taskUpdated}\n`);
                }
                break;
            } case "mark-in-progress": {
                const isValid = validateIdInput(numericId);
                if (!isValid) {
                    const updateValue = "in progress"
                    const taskInProgress = await updateTaskByStatus(numericId, updateValue);
                    process.stdout.write(`${taskInProgress}\n`);
                }
                break;
            } case "mark-done": {
                const isValid = validateIdInput(numericId);
                if (!isValid) {
                    const updateValue = "done"
                    const taskDone = await updateTaskByStatus(numericId, updateValue);
                    process.stdout.write(`${taskDone}\n`);
                }
                break;
            }
            case "list" : {
                if (description !== "done" && description !== "todo" && description !== "in-progress") {
                    process.stdout.write("enter a valid input for listing!")
                }
                const list = await listTasksByStatus(description);
                process.stdout.write(`Tasks set to ${list.status}:\n ${list.tasks}`)
                break;
            }
            case "exit": {
                process.stdout.write("Thank you for using our app...\n");
                process.exit(0);
            }

            default: {
                process.stdout.write("Enter a valid command: add, delete, update, exit.\n");
            }
        }
    });
};

startApp();