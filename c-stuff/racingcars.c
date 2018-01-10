#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct racingCar{
    char name[12];
    int speed;
    struct racingCar *next;
} racingCar;

void printList(struct racingCar *start){
    struct racingCar *currentCar = start;
    int i = 0;

    while (currentCar != NULL) {
        i++;
        printf("Car:%d Name:%s Speed:%d\n",
                i, currentCar->name, currentCar->speed);
        currentCar = currentCar->next;
    }
    printf("Total cars:%d\n", i);
}

int main(){
    struct racingCar RedBull = {"RedBull", 100, NULL};
    struct racingCar Ferrari  = {"Ferrari", 90, NULL};
    struct racingCar McLaren  = {"McLaren", 86, NULL};

    RedBull.next = &Ferrari;
    Ferrari.next = &McLaren;

    printList(&Ferrari);

    return 0;
}
