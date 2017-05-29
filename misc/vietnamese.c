#include <stdio.h>
#include <stdlib.h>
#include <math.h>

int temp;
#define swap(a, b) temp=a; a=b; b=temp;

int x[9] = {1,2,3,4,5,6,7,8,9};
int n = 9;
int results;

void F(){
  double G = (float)x[0]+13.*x[1]/x[2]+(float)x[3]+12.*x[4]-(float)x[5]+(float)x[6]*x[7]/x[8];
  if(G == 87) results++;
}

void generate(int n){
  if (n == 1) F();
  else{
    int i;
    for (i = 0; i < n; i++) {
      generate(n-1);
      if(n%2 == 0) {swap(x[i], x[n - 1]);}
      else {swap(x[0], x[n-1])}
    }
  }
}

int main(){
  generate(n);
  printf("%d\n", results);
}
