/**
 * 
 * TEST THE FILE SYSTEM!
 * Read/Write File! 
 * 
 * 
 * # Adding a new task
 * task-cli add "Buy groceries"
 * # Output: Task added successfully (ID: 1)
 * 
 * # Updating and deleting task
 * task-cli update 1 "Buy groceries and cook dinner"
 * task-cli delete 1
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

import {readFile, writeFile, appendFile} from "node:fs/promises";


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


const handleOverride = async (filteredTasks) => {
    try {
        await writeFile("./tasks.txt", JSON.stringify(filteredTasks, null, 2), "utf-8");
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

const startApp = () => {
    process.stdin.setEncoding("utf-8");
    process.stdin.on("data", async (data) => {
        const input = data.toString().split(" ");
        const inputType = input[0];
        const inputDescription = input.slice(1).join(" ");

        switch(inputType) {
            case "add":
                const task = {
                    description: inputDescription,
                    status: "todo"
                };
                const taskAdded = await addTask(task);
                process.stdout.write(`${taskAdded}\n`);
                break;
            case "delete":
                const taskDeleted = await deleteTask(inputDescription)
                process.stdout.write(`${taskDeleted}\n`);
                break;
            case "update":
                break
            case "exit":
                process.exit(1);
            default: 
                console.log("Enter something valid please!")
        }
    })
}

startApp();