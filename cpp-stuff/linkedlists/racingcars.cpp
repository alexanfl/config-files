#include <stdio.h>
#include <iostream>
using namespace std;

struct node {
    int data;
    node* next;
}; 

struct node_car {
    string data;
    node_car* next;
}; 


int main(int argc, const char *argv[])
{
    int N = 10;

    node* n;
    node* t;
    node* h;

    n = new node;
    n->data = 17;
    t = n;
    h = n;

    for (int i = 2; i < N; i++) {
        n = new node;
        n->data = i*17;
        t->next = n;
        t = n;
    }
    
    n->next = 0;

    node* tmp = h;

    for (int i = 1; i < N; i++) {
        cout << "Element #" << i << " = " << tmp->data << "\n"; 
        tmp = tmp->next;
    }

    node_car* n_car;
    node_car* t_car;
    node_car* h_car;

    n_car = new node_car;
    n_car->data = "Ferrari";
    t_car = n_car;
    h_car = n_car;

    n_car = new node_car;
    n_car->data = "Lamborghini";
    t_car->next = n_car;
    t_car = n_car;

    n_car = new node_car;
    n_car->data = "Porsche";
    t_car->next = n_car;
    t_car = n_car;

    n_car = new node_car;
    n_car->data = "Aston Martin";
    t_car->next = n_car;
    t_car = n_car;

    n_car = new node_car;
    n_car->data = "Volkswagen";
    t_car->next = n_car;
    t_car = n_car;

    n_car = new node_car;
    n_car->data = "Tesla";
    t_car->next = n_car;
    t_car = n_car;

    n_car->next = 0;

    node_car* tmp_car = h_car;

    for (int i = 0; i < 6; i++) {
        cout << "Car: " << tmp_car->data << "\n";
        tmp_car = tmp_car->next;
    }

    return 0;
}
