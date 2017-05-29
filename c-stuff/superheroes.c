#include <stdio.h>

struct superHero{
    char name[20];
    int strength;
}superHero;

void printHelp(){
    printf("These are the available commands:\n");
    printf("\th: Help menu.\n");
    printf("\tprint: Prints a list of all heroes in database.\n");
    printf("\tadd: Add a hero to the database on the form '<heroname> <strengthinteger>'.\n");
    printf("\tq: Quits the database.\n");
}

void printList(struct superHero heroArray[], int num){
    printf("List of heroes in database:\n\n\
#\tName    \tStrength\n");
    int i = 0;
    struct superHero *hero;

    for (i = 0; i < num; i++) {
        hero = &heroArray[i];
        printf("%d\t%s    \t%d\n",
                i+1, hero->name, hero->strength);
    }
    printf("\nTotal of %d heroes\n\n", num);
}

int addHero(struct superHero *hero){
    printf("Add hero and strength: ");
    char input[16];
    fgets(input, 15, stdin);
    int ok = 0;
    
    int res = sscanf(input, "%s %d", hero->name, &hero->strength);

    if (res == 2) {
        ok = 1;
        printf("Added:%s strength: %d\n\n", hero->name, hero->strength);
    }
    else{
        printf("Sorry, error parsing input\n\n");
    }
    return ok;
}


int main(){
    struct superHero marvel[5];
    int numHeroes = 0;

    char command[16]; 
    char input[16];

    printf("Starting superhero database ...\n\nType 'h' for command menu.\n\n");

    while (fgets(input, 15, stdin)) {
        sscanf(input, "%s", command);

        if (strncmp(command, "q", 1) == 0) {
            printf("\n\nQuitting superhero database ... \n\n");
            break;
        }
        else if (strncmp(command, "print", 5) == 0) {
            printList(marvel, numHeroes);
        }
        else if (strncmp(command, "add", 3) == 0) {
            numHeroes += addHero( &marvel[numHeroes]); 
        }
        else if (strncmp(command, "h", 1) == 0){
            printHelp(); 
        }
    }    

    return 0;
}
