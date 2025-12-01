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

const createTaskFile = async () => {
    try {
        await writeFile("./tasks.txt", JSON.stringify([], null, 2), "utf-8");
        return "File created successfully!";
    } catch (e) {
        console.error(e, " when writing file");
        return null;
    }
};

const appendTaskToFile = async (task) => {
    try {
        const tasks = await getTasks();
        task.id = tasks.length + 1;
        tasks.push(task);
        await writeFile("./tasks.txt", JSON.stringify(tasks, null, 2), "utf-8");
        return `Task ${task.id} appended successfully!`;
    } catch (e) {
        console.error(e, " when appending file!");
        return null;
    }
};


const addTask = async (task) => {
    try {
        const allTasks = await getTasks();

        const duplicates = allTasks.filter((todo) => todo.description === task.description);
        
        if (!allTasks && allTasks.length === 0) {
            const newFile = await createTaskFile();
            return newFile ?? "Failed to create file!";
        } else if (duplicates.length > 0) {
            return "This task already exists!";
        } else {
            const isAdded = await appendTaskToFile(task);
            return isAdded;
        }
    } catch (err) {
        console.error(err);
        return "Error when writing file!";
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
                const allTasks = await getTasks();

                const filteredTasks = allTasks.filter(task => task.id !== Number(inputDescription));
                const filteredTask = allTasks.filter(task => task.id === Number(inputDescription));
                const allTaskIds = allTasks.map((task) => {return task.id})

                if (filteredTasks.length === 0 && !filteredTask.length > 0) {
                    process.stdout.write("Todo list is empty! \n" );
                } else if (!allTaskIds.includes(Number(inputDescription))) {
                    process.stdout.write("This id does not exist! \n")
                } else {
                    try {
                        await writeFile("./tasks.txt", JSON.stringify(filteredTasks, null, 2), "utf-8");
                        process.stdout.write(`Deleted Task ${filteredTask[0].description} \n`);
                    } catch (e) {
                        process.stderr.write(e);
                    }
                }

                ///wir brauchen process.argv! 
                // checken ob es eine nummer ist! 
                // dann filter aller tasks nach id! 
                // gefilterter array mit writeFile! Das ganze file überschreiben... 
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