/**
 * 
 * TEST THE FILE SYSTEM!
 * Read/Write File! 
 * 
 * # Marking a task as in progress or done
 * task-cli mark-in-progress 1
 * task-cli mark-done 1
 * 
 * # Listing all tasks
 * task-cli list
 * 
 * # Listing tasks by status
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

const createFile = async () => {
    try {
        await writeFile("./tasks.txt", JSON.stringify([], null, 2), "utf-8");
        return "File created successfully!";
    } catch (e) {
        console.error(e, " when writing file");
        return null;
    }
};


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


const handleOverride = async (updatedTasks) => {
    try {
        await writeFile("./tasks.txt", JSON.stringify(updatedTasks, null, 2), "utf-8");
    } catch (e) {
        process.stderr.write(e);
    }
}

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
    const numericInput = Number(inputDescription);
    const allTasks = await getTasks();
    const index = allTasks.findIndex(task => task.id === numericInput);

    if (index === -1) {
      return "no such id in the list";
    }
  
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

const startApp = () => {
    process.stdin.setEncoding("utf-8");

    process.stdin.on("data", async (data) => {
        const input = data.toString().trim();
        if (!input) return;

        const tokens = input.split(" ");
        const inputType = tokens[0];

        switch (inputType) {
            case "add": {
                const description = tokens.slice(1).join(" ");
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
                const idString = tokens[1];
                const numericId = Number(idString);
                if (isNaN(numericId)) {
                    process.stdout.write("Please provide a valid numeric id to delete.\n");
                    break;
                }
                const taskDeleted = await deleteTask(numericId);
                process.stdout.write(`${taskDeleted}\n`);
                break;
            }

            case "update": {
                const idString = tokens[1];
                const numericId = Number(idString);
                if (isNaN(numericId)) {
                    process.stdout.write("Please provide a valid numeric id to update.\n");
                    break;
                }
                const updateValue = tokens.slice(2).join(" ");
                const taskUpdated = await updateTask(numericId, updateValue);
                process.stdout.write(`update log: ${taskUpdated}\n`);
                break;
            } case "mark-in-progress": {
                const idString = tokens[1];
                const numericId = Number(idString);
                if (isNaN(numericId)) {
                    process.stdout.write("Please provide a valid numeric id to update.\n");
                    break;
                }
            } case "mark-done": {
                const idString = tokens[1];
                const numericId = Number(idString);
                if (isNaN(numericId)) {
                    process.stdout.write("Please provide a valid numeric id to update.\n");
                    break;
                }
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